import { cookies } from "next/headers";
import {
  getCurrentPropertyAccountBalance,
  getStartAndEndOfProvidedMonthAndNextMonth,
  getUsernameFromCookie,
  validatePermission
} from "../../utils/utils";
import { UsageRepository } from "../../repositories/usageRepository";
import { PropertyRepository } from "../../repositories/propertyRepository";
import { PRICING_FORMULAS } from "../pricingFormulas";
import { InvoiceRepository } from "../../repositories/invoiceRepository";
import { InvoiceCreate } from "../../models/Invoice";
import { withErrorHandler } from "../../utils/handlers";
import { PricingFormula } from "../pricingFormulas/types";
import { Discount } from "../../models/Discount";
import { DiscountRepository } from "../../repositories/discountRepository";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const getPricingFormula = (year: number, month: number) => {
  // On Sept 6 2025, there was a W.S.C. meeting and a new formula was adopted.
  const cutoffYear = 2025;
  const cutoffMonth = 9;

  if (year < cutoffYear || (year === cutoffYear && month < cutoffMonth)) {
    return PRICING_FORMULAS["tiered_2025_v1"];
  } else {
    return PRICING_FORMULAS["tiered_2025_September_v1"];
  }
};

const calculateFinalInvoiceCostInPennies = (
  gallons_used: number,
  formula: PricingFormula,
  discounts: Discount[]
): number => {
  // Calculate base cost using the provided pricing formula
  let baseCost = formula.calculate(gallons_used);

  let totalAmountInPenniesToDeduct = 0;
  for (const discount of discounts) {
    // Flat discount for the whole bill
    if (discount.amount_in_pennies && !discount.gallons_applied_to) {
      totalAmountInPenniesToDeduct += discount.amount_in_pennies;
      continue;
    }

    // If discount has gallons_applied_to, only apply discount to that many gallons
    if (discount.gallons_applied_to && discount.gallons_applied_to > 0 && discount.percent_off) {
      const gallonsToBeDiscounted = Math.min(gallons_used, discount.gallons_applied_to);
      const costOfGallonsToBeDiscounted = formula.calculate(gallonsToBeDiscounted);

      totalAmountInPenniesToDeduct += Math.round(costOfGallonsToBeDiscounted * (discount.percent_off / 100));
    }

    // TODO: Apply discount to entire bill? Might not be needed if gallons_applied_to is big
    // TODO: and always covers the necessary amount.
  }

  return Math.max(0, baseCost - totalAmountInPenniesToDeduct);
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "CREATE_INVOICE");

    // TODO: Data validation
    const { month, year } = await req.json();

    if (!month || !year) {
      return new Response("Missing month or year", { status: 400 });
    }

    const { startOfMonth, endOfMonth, startOfNextMonth, endOfNextMonth } = getStartAndEndOfProvidedMonthAndNextMonth(
      year,
      month
    );

    const properties = await PropertyRepository.getAllActiveProperties();

    const propertyIds = properties.map((p: any) => p.id);
    const startingUsages = await UsageRepository.getFirstUsageByDateCollectedRangeAndPropertyIn(
      startOfMonth,
      endOfMonth,
      propertyIds
    );
    const endingUsages = await UsageRepository.getFirstUsageByDateCollectedRangeAndPropertyIn(
      startOfNextMonth,
      endOfNextMonth,
      propertyIds
    );

    let createdBillsCount = 0;

    for (const property of properties) {
      const startingUsage = startingUsages.find((u: any) => u.property_id === property.id);
      const endingUsage = endingUsages.find((u: any) => u.property_id === property.id);

      if (!startingUsage || !endingUsage) continue;

      // Check if invoice already exists
      const existing = await InvoiceRepository.getActiveInvoiceByYearAndMonthAndPropertyIn(
        parseInt(year),
        parseInt(month),
        [property.id]
      );

      if (existing.length > 0) continue;

      const [currentBalanceInPennies, discounts] = await Promise.all([
        getCurrentPropertyAccountBalance(property.id),
        DiscountRepository.getByPropertyId(property.id)
      ]);

      const gallonsUsed = endingUsage.gallons - startingUsage.gallons;
      const formula = getPricingFormula(parseInt(year), parseInt(month));
      const newData: InvoiceCreate = {
        property_id: property.id,
        metadata: {
          billing_month: parseInt(month),
          billing_year: parseInt(year),
          gallons_used: gallonsUsed,
          gallons_start: startingUsage.gallons,
          gallons_end: endingUsage.gallons,
          formula_used: `${formula.name}`,
          current_balance_in_pennies: currentBalanceInPennies,
          discounts: discounts.map(d => {
            return { name: d.name, description: d.description };
          })
        },
        type: "WATER_USAGE",
        amount_in_pennies: calculateFinalInvoiceCostInPennies(gallonsUsed, formula, discounts),
        is_active: true
      };

      await InvoiceRepository.insertNewInvoiceAsTransactional(username, newData);
      createdBillsCount++;
    }

    return Response.json({ message: `${createdBillsCount} bill(s) created.` });
  } catch (error) {
    console.error("Error creating usage bills:", error);
    return new Response("Error creating usage bills", { status: 500 });
  }
};

export const POST = withErrorHandler(handler);

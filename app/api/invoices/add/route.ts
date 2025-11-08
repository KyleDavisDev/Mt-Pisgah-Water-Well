import { cookies } from "next/headers";
import {
  addRandomDaysToDate,
  getPropertyAccountBalanceAtDate,
  getAdjacentMonthRanges,
  getUsernameFromCookie,
  validatePermission
} from "../../utils/utils";
import { UsageRepository } from "../../repositories/usageRepository";
import { PropertyRepository } from "../../repositories/propertyRepository";
import { InvoiceRepository } from "../../repositories/invoiceRepository";
import { InvoiceCreate, InvoiceDiscount } from "../../models/Invoice";
import { withErrorHandler } from "../../utils/handlers";
import { Discount } from "../../models/Discount";
import { DiscountRepository } from "../../repositories/discountRepository";
import { BadRequestError } from "../../utils/errors";
import { getWaterPricingFormulaByYearAndMonth } from "../../fees/createFee";
import { PricingFormula } from "../../fees/water/pricingFormulas/types";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

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

    // TODO: Apply discount to entire bill? Might not be needed if gallons_applied_to is sufficiently big
    // TODO: and always covers the necessary amount.
  }

  return Math.max(0, baseCost - totalAmountInPenniesToDeduct);
};

const handler = async (req: Request): Promise<Response> => {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  const username = await getUsernameFromCookie(jwtCookie);
  await validatePermission(username, "CREATE_INVOICE");

  // TODO: Data validation
  const { month, year, propertyId } = await req.json();

  if (!month || !year) {
    throw new BadRequestError("Missing month or year");
  }

  const { startOfCurrentMonth, endOfCurrentMonth, startOfNextMonth, endOfNextMonth } = getAdjacentMonthRanges(
    year,
    month
  );

  const properties = propertyId ? [{ id: propertyId }] : await PropertyRepository.getAllActiveProperties();
  const propertyIds = properties.map((p: any) => p.id);

  const startingUsages = await UsageRepository.getFirstUsageByDateCollectedRangeAndPropertyIn(
    startOfCurrentMonth,
    endOfCurrentMonth,
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
      getPropertyAccountBalanceAtDate(property.id, `${year}-${month}-15`),
      DiscountRepository.getByPropertyId(property.id)
    ]);

    const gallonsUsed = endingUsage.gallons - startingUsage.gallons;
    const formula = getWaterPricingFormulaByYearAndMonth(parseInt(year), parseInt(month));
    const invoiceCostInPennies = calculateFinalInvoiceCostInPennies(gallonsUsed, formula, discounts);
    const discountsForInvoice: InvoiceDiscount[] = discounts.map(d => {
      return { name: d.name, description: d.description };
    });
    const newData: InvoiceCreate = {
      property_id: property.id,
      metadata: {
        billing_month: parseInt(month),
        billing_year: parseInt(year),
        gallons_used: gallonsUsed,
        gallons_start: startingUsage.gallons,
        gallons_end: endingUsage.gallons,
        formula_used: `${formula.name}`,
        balance_in_pennies_start: currentBalanceInPennies,
        balance_in_pennies_end: currentBalanceInPennies - invoiceCostInPennies,
        discounts: discountsForInvoice
      },
      type: "WATER_USAGE",
      amount_in_pennies: invoiceCostInPennies,
      is_active: true,
      created_at: addRandomDaysToDate(startOfNextMonth, 1, 5)
    };

    await InvoiceRepository.insertNewInvoiceAsTransactional(username, newData);
    createdBillsCount++;
  }

  return Response.json({ message: `${createdBillsCount} bill(s) created.` });
};

export const POST = withErrorHandler(handler);

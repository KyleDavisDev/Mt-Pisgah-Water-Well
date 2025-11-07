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
import { getWaterPricingFormulaByName, getWaterPricingFormulaByYearAndMonth } from "../../fees/createFee";
import { PricingFormula } from "../../fees/water/pricingFormulas/types";
import { BillCreate, BillDiscount } from "../../models/Bills";
import { BillRepository } from "../../repositories/billRepository";
import { FeeRepository } from "../../repositories/FeeRepository";
import Fee, { WaterUsageMetaData } from "../../models/Fee";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const calculateFinalInvoiceCostInPennies = (fees: Fee[], discount: Discount | undefined): number => {
  // Calculate base cost using the provided pricing formula
  const totalInFees = fees.reduce((accum: number, curr: Fee) => accum + (curr.amount_in_pennies ?? 0), 0);
  const waterUsage = fees.filter(fee => fee.category === "WATER_USAGE")[0];

  let totalAmountInPenniesToDeduct = 0;
  if (discount) {
    // Flat discount for the whole bill
    if (discount.amount_in_pennies && !discount.gallons_applied_to) {
      totalAmountInPenniesToDeduct += discount.amount_in_pennies;
    }
    // If discount has gallons_applied_to, only apply discount to that many gallons
    else if (discount.gallons_applied_to && discount.gallons_applied_to > 0 && discount.percent_off) {
      const gallonsToBeDiscounted = Math.min(
        (waterUsage.metadata as WaterUsageMetaData).gallons_used,
        discount.gallons_applied_to
      );
      const pricingFormula = getWaterPricingFormulaByName((waterUsage.metadata as WaterUsageMetaData).formula_used);
      const costOfGallonsToBeDiscounted = pricingFormula.calculate(gallonsToBeDiscounted);

      totalAmountInPenniesToDeduct += Math.round(costOfGallonsToBeDiscounted * (discount.percent_off / 100));
    }

    // TODO: Apply discount to entire bill? Might not be needed if gallons_applied_to is sufficiently big
    // TODO: and always covers the necessary amount.
  }

  return Math.max(0, totalInFees - totalAmountInPenniesToDeduct);
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

  let createdBillsCount = 0;

  for (const propertyId of propertyIds) {
    // 1. Check if Bill already exists
    const existingBill = await BillRepository.getActiveBillByYearAndMonthAndPropertyIn(year, month, [propertyId]);
    if (existingBill && existingBill.length > 0) {
      continue; // Skip if bill exists
    }

    // 2. Do database lookups. Get fees, current balance, and check for any discounts
    const [fees, currentBalanceInPennies, discounts] = await Promise.all([
      FeeRepository.getActiveFeesByYearAndMonthAndPropertyIn(parseInt(year, 10), parseInt(month, 10), [propertyId]),
      getPropertyAccountBalanceAtDate(propertyId, `${year}-${month}-15`),
      DiscountRepository.getByPropertyId(propertyId)
    ]);

    const waterUsageFees = fees.filter(fee => fee.category === "WATER_USAGE");
    if (waterUsageFees.length !== 1) {
      // TODO: What do we do here? There should always be exactly one water usage fee per month.
      continue;
    }
    const discount = discounts ? discounts[0] : undefined;

    // 3. Get pieces of the object
    const invoiceCostInPennies = calculateFinalInvoiceCostInPennies(fees, discount);

    // 4. Construct insertion object
    const newData: BillCreate = {
      property_id: propertyId,
      metadata: {
        account_balance: {
          balance_in_pennies_start: currentBalanceInPennies,
          balance_in_pennies_end: currentBalanceInPennies - invoiceCostInPennies
        },
        water_usage: {
          amount_in_pennies: waterUsageFees[0].amount_in_pennies,
          gallons_start: (waterUsageFees[0].metadata as WaterUsageMetaData).gallons_start,
          gallons_end: (waterUsageFees[0].metadata as WaterUsageMetaData).gallons_end,
          gallons_used: (waterUsageFees[0].metadata as WaterUsageMetaData).gallons_used,
          formula_used: (waterUsageFees[0].metadata as WaterUsageMetaData).formula_used,
          usage_month: (waterUsageFees[0].metadata as WaterUsageMetaData).usage_month,
          usage_year: (waterUsageFees[0].metadata as WaterUsageMetaData).usage_year
        },
        discounts: discount ?? {
          name: discounts[0].name,
          description: discounts[0].description
        }
      },
      total_in_pennies: invoiceCostInPennies,
      is_active: true,
      created_at: addRandomDaysToDate(startOfNextMonth, 1, 5)
    };

    await BillRepository.insertNewBillAsTransactional(username, newData);
    createdBillsCount++;
  }

  return Response.json({ message: `${createdBillsCount} bill(s) created.` });
};

export const POST = withErrorHandler(handler);

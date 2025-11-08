import { cookies } from "next/headers";
import {
  addRandomDaysToDate,
  getPropertyAccountBalanceAtDate,
  getAdjacentMonthRanges,
  getUsernameFromCookie,
  validatePermission
} from "../../utils/utils";
import { PropertyRepository } from "../../repositories/propertyRepository";
import { withErrorHandler } from "../../utils/handlers";
import { Discount } from "../../models/Discount";
import { DiscountRepository } from "../../repositories/discountRepository";
import { BadRequestError } from "../../utils/errors";
import { getWaterPricingFormulaByName, splitFeesByCategory } from "../../fees/createFee";
import { BillCreate } from "../../models/Bills";
import { BillRepository } from "../../repositories/billRepository";
import { FeeRepository } from "../../repositories/FeeRepository";
import Fee, {
  AdministrativeMetaData,
  CustomMetaData,
  LateMetaData,
  ServiceMetaData,
  WaterUsageMetaData
} from "../../models/Fee";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const calculateFinalCostInPennies = (fees: Fee[], discount: Discount | null): number => {
  let totalAmountInPenniesToDeduct = 0;
  if (discount) {
    // Flat discount for the whole bill
    if (discount.amount_in_pennies && !discount.gallons_applied_to) {
      totalAmountInPenniesToDeduct += discount.amount_in_pennies;
    }
    // If discount has gallons_applied_to, only apply discount to that many gallons
    else if (discount.gallons_applied_to && discount.gallons_applied_to > 0 && discount.percent_off) {
      const waterUsage = fees.filter(fee => fee.category === "WATER_USAGE")[0];

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

  // Calculate base cost by simply adding together all of the fees.
  const totalInFees = fees.reduce((accum: number, curr: Fee) => accum + (curr.amount_in_pennies ?? 0), 0);

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

  const { startOfNextMonth } = getAdjacentMonthRanges(year, month);

  const properties = propertyId ? [{ id: propertyId }] : await PropertyRepository.getAllActiveProperties();
  const propertyIds = properties.map((p: any) => p.id);

  let createdBillsCount = 0;

  for (const propertyId of propertyIds) {
    // 1. Check if Bill already exists
    const existingBill = await BillRepository.getActiveBillByYearAndMonthAndPropertyIn(year, month, [propertyId]);
    if (existingBill && existingBill.length > 0) {
      continue; // Skip if bill exists
    }

    // 2. Database lookups: Get fees, current balance, and any discounts
    const [fees, currentBalanceInPennies, discount] = await Promise.all([
      FeeRepository.getUnbilledActiveFeesByYearMonthAndPropertyIds(parseInt(year, 10), parseInt(month, 10), [
        propertyId
      ]),
      getPropertyAccountBalanceAtDate(propertyId, `${year}-${month}-15`),
      DiscountRepository.getFirstActiveValidOnDateByPropertyId(`${year}-${month}-15`, propertyId)
    ]);

    const feesByCategory = splitFeesByCategory(fees);
    if (feesByCategory["WATER_USAGE"].length > 1) {
      // TODO: What do we do here? There should not be more than one water usage fee per month. Skip for now.
      continue;
    }

    // 3. Get the final cost of the invoice
    const invoiceCostInPennies = calculateFinalCostInPennies(fees, discount);

    // 4. Construct insertion object
    const newData: BillCreate = {
      property_id: propertyId,
      metadata: {
        account_balance: {
          balance_in_pennies_start: currentBalanceInPennies,
          balance_in_pennies_end: currentBalanceInPennies - invoiceCostInPennies
        },
        water_usage: feesByCategory["WATER_USAGE"][0]
          ? {
              amount_in_pennies: feesByCategory["WATER_USAGE"][0].amount_in_pennies,
              gallons_start: (feesByCategory["WATER_USAGE"][0].metadata as WaterUsageMetaData).gallons_start,
              gallons_end: (feesByCategory["WATER_USAGE"][0].metadata as WaterUsageMetaData).gallons_end,
              gallons_used: (feesByCategory["WATER_USAGE"][0].metadata as WaterUsageMetaData).gallons_used,
              formula_used: (feesByCategory["WATER_USAGE"][0].metadata as WaterUsageMetaData).formula_used,
              usage_month: (feesByCategory["WATER_USAGE"][0].metadata as WaterUsageMetaData).usage_month,
              usage_year: (feesByCategory["WATER_USAGE"][0].metadata as WaterUsageMetaData).usage_year
            }
          : undefined,
        discount: discount
          ? {
              name: discount.name,
              description: discount.description
            }
          : undefined,
        administrative:
          feesByCategory["ADMINISTRATIVE"].length > 0
            ? feesByCategory["ADMINISTRATIVE"].map(x => {
                return {
                  amount_in_pennies: x.amount_in_pennies,
                  description: (x.metadata as AdministrativeMetaData).description
                };
              })
            : undefined,
        late:
          feesByCategory["LATE_FEE"].length > 0
            ? feesByCategory["LATE_FEE"].map(x => {
                return {
                  amount_in_pennies: x.amount_in_pennies,
                  description: (x.metadata as LateMetaData).description
                };
              })
            : undefined,
        services:
          feesByCategory["SERVICE_FEE"].length > 0
            ? feesByCategory["SERVICE_FEE"].map(x => {
                return {
                  amount_in_pennies: x.amount_in_pennies,
                  description: (x.metadata as ServiceMetaData).description
                };
              })
            : undefined,
        customs:
          feesByCategory["CUSTOM"].length > 0
            ? feesByCategory["CUSTOM"].map(x => {
                return {
                  amount_in_pennies: x.amount_in_pennies,
                  description: (x.metadata as CustomMetaData).description
                };
              })
            : undefined
      },
      total_in_pennies: invoiceCostInPennies,
      billing_month: month,
      billing_year: year,
      is_active: true,
      created_at: addRandomDaysToDate(startOfNextMonth, 1, 3)
    };

    await BillRepository.insertNewBillAsTransactional(username, newData, fees);
    createdBillsCount++;
  }

  return Response.json({ message: `${createdBillsCount} bill(s) created.` });
};

export const POST = withErrorHandler(handler);

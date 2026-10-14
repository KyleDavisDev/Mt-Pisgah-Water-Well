import {
  addRandomDaysToDate,
  getPropertyAccountBalanceAtDate,
  getAdjacentMonthRanges
} from "../../utils/utils";
import { PropertyRepository } from "../../repositories/propertyRepository";
import { withAuthenticationHandler, withErrorHandler } from "../../utils/handlers";
import { BadRequestError } from "../../utils/errors";
import { splitFeesByCategory } from "../../fees/createFee";
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

const handler = async (req: Request, _ctx: unknown, username: string): Promise<Response> => {
  // TODO: Data validation
  const { month, year, propertyId } = await req.json();

  if (!month || !year) {
    throw new BadRequestError("Missing month or year");
  }

  const { startOfCurrentMonth, endOfCurrentMonth } = getAdjacentMonthRanges(year, month);
  console.log(endOfCurrentMonth);

  const properties = propertyId ? [{ id: propertyId }] : await PropertyRepository.getAllActiveProperties();
  const propertyIds = properties.map((p: any) => p.id);

  let createdBillsCount = 0;

  // TODO: Create missing water fees for each property.
  // await createAndInsertWaterUsageFees();

  for (const propertyId of propertyIds) {
    // 1. Database lookups: Get fees and the current balance
    const [fees, currentBalanceInPennies] = await Promise.all([
      FeeRepository.getUnbilledActiveFeesBetweenDatesAndPropertyIds(startOfCurrentMonth, endOfCurrentMonth, [
        propertyId
      ]),
      getPropertyAccountBalanceAtDate(propertyId, endOfCurrentMonth)
    ]);

    const feesByCategory = splitFeesByCategory(fees);
    if (feesByCategory["WATER_USAGE"].length !== 1) {
      // A bill must have exactly one water usage fee. Zero could be a stray DISCOUNT fee; more than one is invalid.
      continue;
    }

    // 3. The cost is the sum of all fees (a DISCOUNT fee, if present, is already negative)
    const invoiceCostInPennies = fees.reduce((accum: number, curr: Fee) => accum + (curr.amount_in_pennies ?? 0), 0);

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
      created_at: addRandomDaysToDate(`${year}-${month}-02`, 1, 2)
    };

    await BillRepository.insertNewBillAsTransactional(username, newData, fees);
    createdBillsCount++;
  }

  return Response.json({ message: `${createdBillsCount} bill(s) created.` });
};

export const POST = withErrorHandler(withAuthenticationHandler(handler, ["CREATE_INVOICE"]));

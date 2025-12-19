import Fee, { FeeCreate, WaterUsageMetaData } from "../../../models/Fee";
import { addRandomDaysToDate, getAdjacentMonthRanges, parseYMD, validatePermission } from "../../../utils/utils";
import { UsageRepository } from "../../../repositories/usageRepository";
import { FeeRepository } from "../../../repositories/FeeRepository";
import { PricingFormula } from "../pricingFormulas/types";
import { getWaterPricingFormulaByYearAndMonth } from "../../createFee";

export const createAndInsertWaterUsageFees = async (
  dateCollected: string,
  propertyIds: number[],
  username: string
): Promise<Fee[] | null> => {
  await validatePermission(username, "CREATE_FEE");
  const { year, month } = parseYMD(dateCollected);

  const { startOfPreviousMonth, endOfPreviousMonth, startOfCurrentMonth, endOfCurrentMonth } = getAdjacentMonthRanges(
    year,
    month
  );

  const startingUsages = await UsageRepository.getFirstUsageByDateCollectedRangeAndPropertyIn(
    startOfPreviousMonth,
    endOfPreviousMonth,
    propertyIds
  );
  const endingUsages = await UsageRepository.getFirstUsageByDateCollectedRangeAndPropertyIn(
    startOfCurrentMonth,
    endOfCurrentMonth,
    propertyIds
  );

  const fees: Fee[] = [];
  for (const propertyId of propertyIds) {
    const startingUsage = startingUsages.find((u: any) => u.property_id === propertyId);
    const endingUsage = endingUsages.find((u: any) => u.property_id === propertyId);

    if (!startingUsage || !endingUsage) continue;

    // Check if fee already exists
    const existing = await FeeRepository.getActiveFeesByYearAndMonthAndPropertyIn(parseInt(year), parseInt(month), [
      propertyId
    ]);

    if (existing.length > 0) continue;

    const prevMonth = parseYMD(startOfPreviousMonth);
    const formula: PricingFormula = getWaterPricingFormulaByYearAndMonth(
      parseInt(prevMonth.year),
      parseInt(prevMonth.month)
    );

    const gallonsUsed = endingUsage.gallons - startingUsage.gallons;

    const metadata: WaterUsageMetaData = {
      gallons_used: gallonsUsed,
      gallons_start: startingUsage.gallons,
      gallons_end: endingUsage.gallons,
      formula_used: `${formula.name}`,
      usage_month: parseInt(prevMonth.month, 10),
      usage_year: parseInt(prevMonth.year, 10)
    };

    const newData: FeeCreate = {
      property_id: propertyId,
      bill_id: null,
      metadata,
      category: "WATER_USAGE",
      amount_in_pennies: formula.calculate(gallonsUsed),
      is_active: true,
      created_at: addRandomDaysToDate(startOfCurrentMonth, 1, 3)
    };

    const fee = await FeeRepository.insertNewFeeAsTransactional(username, newData);
    if (fee) fees.push(fee);
  }

  return fees.length > 0 ? fees : null;
};

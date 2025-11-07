import { cookies } from "next/headers";

import {
  addRandomDaysToDate,
  getAdjacentMonthRanges,
  getUsernameFromCookie,
  parseYMD,
  validatePermission
} from "../../../utils/utils";
import { BadRequestError } from "../../../utils/errors";
import { UsageRepository } from "../../../repositories/usageRepository";
import { getWaterPricingFormulaByYearAndMonth } from "../../createFee";
import { withErrorHandler } from "../../../utils/handlers";
import Fee, { FeeCreate, WaterUsageMetaData } from "../../../models/Fee";
import { FeeRepository } from "../../../repositories/FeeRepository";
import { PricingFormula } from "../pricingFormulas/types";
import { PropertyRepository } from "../../../repositories/propertyRepository";

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
    // TODO: Might have an off-by-one here.
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

const handler = async (req: Request): Promise<Response> => {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  const username = await getUsernameFromCookie(jwtCookie);

  // TODO: Data validation
  const { month, year, propertyId } = await req.json();

  if (!month || !year) {
    throw new BadRequestError("Missing month or year");
  }

  const properties = propertyId ? [{ id: propertyId }] : await PropertyRepository.getAllActiveProperties();

  const fees = createAndInsertWaterUsageFees(
    `${year}-${month}-02`,
    properties.map(x => x.id),
    username
  );

  return Response.json({ message: `${fees} fees(s) created.` });
};

export const POST = withErrorHandler(handler);

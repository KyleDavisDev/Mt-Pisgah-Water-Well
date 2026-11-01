import Fee, { FeeCreate, DiscountMetaData, WaterUsageMetaData } from "../../../models/Fee";
import { addRandomDaysToDate, getAdjacentMonthRanges, parseYMD, validatePermission } from "../../../utils/utils";
import { FeeRepository } from "../../../repositories/FeeRepository";
import { Discount } from "../../../models/Discount";
import { PricingFormula } from "../../water/pricingFormulas/types";
import { getWaterPricingFormulaByName } from "../../createFee";
import { DiscountRepository } from "../../../repositories/discountRepository";

const isFlatDiscount = (discount: Discount) => {
  return discount.amount_in_pennies && discount.amount_in_pennies > 0 && !discount.gallons_applied_to;
};

const isPercentageDiscount = (discount: Discount) => {
  return (
    discount.gallons_applied_to &&
    discount.gallons_applied_to > 0 &&
    discount.percent_off &&
    discount.percent_off > 0 &&
    discount.percent_off <= 100
  );
};

export const calculateDiscountAmountInPennies = (fees: Fee[], discount: Discount): number => {
  if (isFlatDiscount(discount)) {
    const totalFeeAmountInPennies = fees
      .filter(x => x.category !== "DISCOUNT")
      .reduce((accum: number, curr: Fee) => accum + (curr.amount_in_pennies ?? 0), 0);

    // Do not discount more than cost of all of the fees
    return Math.min(totalFeeAmountInPennies, discount.amount_in_pennies ?? 0);
  }

  if (isPercentageDiscount(discount)) {
    const waterFee = fees.find(fee => fee.category === "WATER_USAGE");
    if (!waterFee) return 0;

    const { formula_used: formulaUsed, gallons_used: gallonsUsed } = waterFee.metadata as WaterUsageMetaData;

    const gallonsToBeDiscounted = Math.min(gallonsUsed, discount.gallons_applied_to ?? 0);

    const pricingFormula = getWaterPricingFormulaByName(formulaUsed);
    if (!pricingFormula) return 0;

    const costOfGallonsToBeDiscounted = pricingFormula.calculate(gallonsToBeDiscounted);

    // Apply percent_off to the discounted water amount to get the final answer
    return Math.round(costOfGallonsToBeDiscounted * ((discount.percent_off ?? 0) / 100));
  }

  return 0;
};

export const buildDiscountFees = async (
  dateCollected: string,
  propertyIds: number[],
  username: string
): Promise<FeeCreate[]> => {
  await validatePermission(username, "CREATE_FEE");
  const { year, month } = parseYMD(dateCollected);

  const { startOfCurrentMonth } = getAdjacentMonthRanges(year, month);

  const fees: FeeCreate[] = [];
  for (const propertyId of propertyIds) {
    const discount = await DiscountRepository.getFirstActiveValidOnDateAndPropertyId(propertyId, `${year}-${month}-15`);
    if (!discount) continue;

    const alreadyActiveFees = await FeeRepository.getActiveFeesByYearAndMonthAndPropertyIn(
      parseInt(year, 10),
      parseInt(month, 10),
      [propertyId]
    );

    // Idempotency check
    const discountFee = alreadyActiveFees.find(fee => fee.category === "DISCOUNT");
    if (discountFee) continue;

    // Sanity check for negative discount amount
    const discountAmountInPennies = calculateDiscountAmountInPennies(alreadyActiveFees, discount);
    if (discountAmountInPennies <= 0) continue;

    let metadata = { name: discount.name, description: discount.description } as DiscountMetaData;

    const items: FeeCreate = {
      property_id: propertyId,
      bill_id: null,
      metadata,
      category: "DISCOUNT",
      amount_in_pennies: -1 * discountAmountInPennies,
      is_active: true,
      // TODO: Use current UTC datetime here instead
      created_at: addRandomDaysToDate(startOfCurrentMonth, 1, 2)
    };

    fees.push(items);
  }

  return fees;
};

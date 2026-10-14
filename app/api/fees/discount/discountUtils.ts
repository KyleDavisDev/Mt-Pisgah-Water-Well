import { Discount } from "../../models/Discount";
import Fee, { WaterUsageMetaData } from "../../models/Fee";
import { getWaterPricingFormulaByName } from "../createFee";
import { PricingFormula } from "../water/pricingFormulas/types";

export const calculateDiscountAmountInPennies = (fees: Fee[], discount: Discount): number => {
  // Flat discount for the whole bill
  if (discount.amount_in_pennies && !discount.gallons_applied_to) {
    const totalFeeAmountInPennies = fees
      .filter(x => x.category !== "DISCOUNT")
      .reduce((accum: number, curr: Fee) => accum + (curr.amount_in_pennies ?? 0), 0);

    // Do not discount more than cost of all of the fees
    return Math.min(totalFeeAmountInPennies, discount.amount_in_pennies);
  }

  // If discount has gallons_applied_to, only apply discount to that many gallons
  if (
    discount.gallons_applied_to &&
    discount.gallons_applied_to > 0 &&
    discount.percent_off &&
    discount.percent_off > 0 &&
    discount.percent_off <= 100
  ) {
    const waterFee = fees.find(fee => fee.category === "WATER_USAGE");
    if (!waterFee) return 0;

    const { formula_used: formulaUsed, gallons_used: gallonsUsed } = waterFee.metadata as WaterUsageMetaData;

    const gallonsToBeDiscounted = Math.min(gallonsUsed, discount.gallons_applied_to);

    const pricingFormula: PricingFormula = getWaterPricingFormulaByName(formulaUsed);
    if (!pricingFormula) return 0;

    const costOfGallonsToBeDiscounted = pricingFormula.calculate(gallonsToBeDiscounted);

    // Apply percent_off to the discounted water amount to get the final answer
    return Math.round(costOfGallonsToBeDiscounted * (discount.percent_off / 100));
  }

  return 0;
};

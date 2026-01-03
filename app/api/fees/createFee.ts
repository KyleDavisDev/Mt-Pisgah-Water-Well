import { PRICING_FORMULAS } from "./water/pricingFormulas";
import { PricingFormula } from "./water/pricingFormulas/types";
import Fee, { FeeType } from "../models/Fee";

export const getWaterPricingFormulaByYearAndMonth = (year: number, month: number): PricingFormula => {
  // Simple, scrappy way to turn year and month to the expected format.
  // Validations and/or sanity checks would improve this.
  const dateString = `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-01`;
  const date = new Date(dateString);

  return getWaterPricingFormulaByDate(date);
};

export const getWaterPricingFormulaByDate = (providedDate: Date): PricingFormula => {
  // On Sept 6 2025, there was a W.S.C. meeting and a new formula was adopted.
  const cutoffDate = new Date("2025-09-01");

  if (providedDate < cutoffDate) {
    return PRICING_FORMULAS["tiered_2025_v1"];
  } else {
    return PRICING_FORMULAS["tiered_2025_September_v1"];
  }
};

export const getWaterPricingFormulaByName = (name: string): PricingFormula => {
  return PRICING_FORMULAS[name];
};

type FeeCategoryMap = Record<FeeType, Fee[]>;

export const splitFeesByCategory = (fees: Fee[]): FeeCategoryMap => {
  // Initialize all categories to empty arrays
  const initial: FeeCategoryMap = {
    WATER_USAGE: [],
    ADMINISTRATIVE: [],
    LATE_FEE: [],
    SERVICE_FEE: [],
    CUSTOM: []
  };

  return fees.reduce((acc, fee) => {
    acc[fee.category].push(fee);
    return acc;
  }, initial);
};

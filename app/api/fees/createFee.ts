import { PRICING_FORMULAS } from "./water/pricingFormulas";

export const getWaterPricingFormulaByYearAndMonth = (year: number, month: number) => {
  // Simple, scrappy way to turn year and month to the expected format.
  // Validations and/or sanity checks would improve this.
  const dateString = `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-01`;
  const date = new Date(dateString);

  return getWaterPricingFormulaByDate(date);
};

export const getWaterPricingFormulaByDate = (providedDate: Date) => {
  // On Sept 6 2025, there was a W.S.C. meeting and a new formula was adopted.
  const cutoffDate = new Date("2025-06-01");

  if (providedDate < cutoffDate) {
    return PRICING_FORMULAS["tiered_2025_v1"];
  } else {
    return PRICING_FORMULAS["tiered_2025_September_v1"];
  }
};

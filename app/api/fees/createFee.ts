import { PRICING_FORMULAS } from "../invoices/pricingFormulas";

export const getWaterPricingFormula = (year: number, month: number) => {
  // On Sept 6 2025, there was a W.S.C. meeting and a new formula was adopted.
  const cutoffYear = 2025;
  const cutoffMonth = 9;

  if (year < cutoffYear || (year === cutoffYear && month < cutoffMonth)) {
    return PRICING_FORMULAS["tiered_2025_v1"];
  } else {
    return PRICING_FORMULAS["tiered_2025_September_v1"];
  }
};

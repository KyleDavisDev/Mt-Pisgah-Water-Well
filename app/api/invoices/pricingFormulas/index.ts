import { PricingFormula } from "./types";
import { Tiered2025Formula } from "./Tiered2025Formula";
import { FlatRateFormula } from "./FlatRateFormula";

export const PRICING_FORMULAS: Record<string, PricingFormula> = {
  tiered_2025_v1: new Tiered2025Formula(),
  flat_rate: new FlatRateFormula()
};

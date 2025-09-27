import { PricingFormula } from "./types";
import { Tiered2025Formula } from "./Tiered2025Formula";
import { FlatRateFormula } from "./FlatRateFormula";
import { Tiered2025SeptFormula } from "./Tiered2025SeptFormula";

export const PRICING_FORMULAS: Record<string, PricingFormula> = {
  tiered_2025_v1: new Tiered2025Formula(),
  tiered_2025_September_v1: new Tiered2025SeptFormula(),
  flat_rate: new FlatRateFormula()
};

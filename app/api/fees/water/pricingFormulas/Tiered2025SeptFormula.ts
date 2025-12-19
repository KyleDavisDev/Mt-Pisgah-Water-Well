import { PricingFormula } from "./types";

export class Tiered2025SeptFormula implements PricingFormula {
  name = "tiered_2025_September_v1";
  description = "Flat $30 for first 4000 gallons, then $0.02 for 5 gallons thereafter";
  baseFeeInPennies = 3000;
  baseGallons = 4000;
  usageRateInPennies = 0.4;

  calculate(gallons: number): number {
    if (gallons <= this.baseGallons) return this.baseFeeInPennies;
    return this.baseFeeInPennies + Math.round((gallons - this.baseGallons) * this.usageRateInPennies);
  }
}

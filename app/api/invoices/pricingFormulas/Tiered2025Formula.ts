import { PricingFormula } from "./types";

export class Tiered2025Formula implements PricingFormula {
  name = "tiered_2025_v1";
  description = "Flat $21 for first 4000 gallons, then $0.01 for 5 gallons thereafter";
  baseFeeInPennies = 2100;
  baseGallons = 4000;
  usageRateInPennies = 0.2;

  calculate(gallons: number): number {
    if (gallons <= this.baseGallons) return this.baseFeeInPennies;
    return this.baseFeeInPennies + Math.round((gallons - this.baseGallons) * this.usageRateInPennies);
  }
}

import { PricingFormula } from "./types";

export class FlatRateFormula implements PricingFormula {
  name = "flat_rate";
  description = "Simple flat fee of $25";
  baseFeeInPennies = 2500;
  baseGallons = 0;
  usageRateInPennies = 0;

  calculate(_gallons: number): number {
    return this.baseFeeInPennies;
  }
}

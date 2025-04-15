export interface PricingFormula {
  name: string;
  description: string;
  baseFeeInPennies: number; // Flat fee in pennies
  baseGallons: number; // Gallons included in base fee
  usageRateInPennies: number; // Rate in pennies per gallon over baseGallons
  lateFeeInPennies?: number; // Optional flat late fee in pennies
  calculate: (gallons: number) => number;
}

import Invoice from "./Invoice";

export type FeeType = "WATER_USAGE" | "ADMINISTRATIVE" | "LATE_FEE" | "SERVICE_FEE" | "CUSTOM";

export default interface Fee {
  id: number;
  property_id: number;
  bill_id: number | null;
  amount_in_pennies: number;
  category: FeeType;
  metadata: FeeMetaData;
  created_at: string; // ISO 8601 timestamp
  is_active: boolean;
}

export type FeeMetaData = WaterUsageMetaData | AdministrativeMetaData | LateMetaData | ServiceMetaData | CustomMetaData;

export type WaterUsageMetaData = {
  gallons_start: number;
  gallons_end: number;
  gallons_used: number;
  formula_used: string;
  usage_month: number;
  usage_year: number;
};

export type AdministrativeMetaData = {
  description: string;
};

export type LateMetaData = {
  description: string;
};

export type ServiceMetaData = {
  description: string;
};

export type CustomMetaData = {
  description: string;
};

export type FeeCreate = Omit<Fee, "id">;

import { AdministrativeMetaData, CustomMetaData, LateMetaData, ServiceMetaData, WaterUsageMetaData } from "./Fee";

export default interface Bill {
  id: number;
  property_id: number;
  total_in_pennies: number;
  billing_month: number;
  billing_year: number;
  metadata: BillMetaData;
  created_at: string; // ISO 8601 timestamp
  is_active: boolean;
}

export type BillDiscount = {
  name: string;
  description: string;
};

export type BillMetaData = {
  water_usage: WaterUsageMetaData;
  discounts?: BillDiscount[];
  administrative?: AdministrativeMetaData;
  late?: LateMetaData;
  service?: ServiceMetaData;
  custom?: CustomMetaData;
};

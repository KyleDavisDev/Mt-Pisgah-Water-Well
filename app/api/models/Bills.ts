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
  account_balance: AccountMetaData;
  water_usage?: WaterBillMetaData;
  discount?: BillDiscount;
  administrative?: AdministrativeBillMetaData[];
  late?: LateBillMetaData[];
  services?: ServiceBillMetaData[];
  customs?: CustomBillMetaData[];
};

export type AccountMetaData = {
  balance_in_pennies_start: number;
  balance_in_pennies_end: number;
};

export type WaterBillMetaData = WaterUsageMetaData & {
  amount_in_pennies: number;
};

export type AdministrativeBillMetaData = AdministrativeMetaData & { amount_in_pennies: number };
export type LateBillMetaData = LateMetaData & { amount_in_pennies: number };
export type ServiceBillMetaData = ServiceMetaData & { amount_in_pennies: number };
export type CustomBillMetaData = CustomMetaData & { amount_in_pennies: number };

export type BillCreate = Omit<Bill, "id">;

export interface BillTotal {
  property_id: number;
  total_in_pennies: number;
}

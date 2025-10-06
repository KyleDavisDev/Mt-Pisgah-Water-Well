export interface Discount {
  id: number;
  name: string;
  description: string;
  amount_in_pennies?: number | null;
  percent_off?: number | null;
  gallons_applied_to?: number | null;
  is_active: boolean;
  created_at: string; // ISO 8601 timestamp
}

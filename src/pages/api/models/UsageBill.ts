import User from "./Users";
import Property from "./Properties";

export default interface UsageBill {
  id: number;
  property_id: number;
  property?: Property; // Optional relationship
  billing_month: string; // Format YYYY-MM-DD (first of the month)
  gallons_used: number;
  formula_used: string;
  amount_in_pennies: number;
  created_at: string;
  created_by_id: number;
  created_by?: User; // Optional relationship
  deleted_at?: string | null;
  deleted_by_id?: number | null;
  deleted_by?: User | null; // Optional relationship
}

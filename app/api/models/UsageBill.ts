export default interface UsageBill {
  id: number;
  property_id: number;
  billing_month: string;
  billing_year: string;
  gallons_used: number;
  formula_used?: string | null;
  amount_in_pennies: number;
  created_at: string; // ISO 8601 timestamp
  is_active: boolean;
}

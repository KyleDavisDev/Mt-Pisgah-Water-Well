export default interface Invoice {
  id: number;
  property_id: number;
  billing_month: number;
  billing_year: number;
  gallons_used: number;
  formula_used: string;
  amount_in_pennies: number;
  created_at: string; // ISO 8601 timestamp
  is_active: boolean;
}

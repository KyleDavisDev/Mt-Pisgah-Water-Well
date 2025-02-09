export default interface UsageBill {
  id: number;
  property_id: number;
  billing_month: string; // Stored as YYYY-MM-DD
  gallons_used: number;
  formula_used?: string | null;
  amount_in_pennies: number;
  is_active: boolean;
}

export interface LateFee {
  id: number;
  usage_bill_id: number;
  amount_in_pennies: number;
  reason?: string | null;
  created_at: string; // ISO timestamp format (e.g. "2025-04-14T18:00:00.000Z")
}
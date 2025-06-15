export default interface Payment {
  id: number;
  amount_in_pennies: number;
  method: string;
  property_id: number;
  created_at: string; // ISO 8601 timestamp
  is_active: boolean;
  transaction_issued_by?: string | null;
  transaction_id?: string | null;
}

export type PaymentCreate = Omit<Payment, "id">;

export interface PaymentTotal {
  property_id: number;
  amount_in_pennies: number;
}

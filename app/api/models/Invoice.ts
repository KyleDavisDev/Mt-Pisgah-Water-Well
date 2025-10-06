export type InvoiceType = "WATER_USAGE" | "LATE_FEE";

export default interface Invoice {
  id: number;
  property_id: number;
  amount_in_pennies: number;
  type: InvoiceType;
  metadata: InvoiceMetadata;
  created_at: string; // ISO 8601 timestamp
  is_active: boolean;
}

export type InvoiceCreate = Omit<Invoice, "id" | "created_at">;

export interface InvoiceTotal {
  property_id: number;
  amount_in_pennies: number;
}

export interface InvoiceMetadata extends Record<string, unknown> {
  discounts: { name: string; description: string | null | undefined }[];
  gallons_end: number;
  billing_year: number;
  formula_used: string;
  gallons_used: number;
  billing_month: number;
  gallons_start: number;
  balance_in_pennies_start: number;
  balance_in_pennies_end: number;
}

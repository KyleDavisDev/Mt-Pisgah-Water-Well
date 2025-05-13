export type InvoiceType = "WATER_USAGE" | "LATE_FEE";

export default interface Invoice {
  id: number;
  property_id: number;
  amount_in_pennies: number;
  type: InvoiceType;
  metadata: Record<string, any>; // formula_used, gallons_used, billing_month, billing_year, late fee reason, etc.
  created_at: string; // ISO 8601 timestamp
  is_active: boolean;
}

export type InvoiceCreate = Omit<Invoice, "id" | "created_at">;

export interface PropertyDiscount {
  id: number;
  property_id: number;
  discount_id: number;
  valid_from?: string | null; // ISO 8601 timestamp
  valid_to?: string | null;   // ISO 8601 timestamp
  is_active: boolean;
  created_at: string; // ISO 8601 timestamp
}
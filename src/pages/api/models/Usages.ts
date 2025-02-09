export default interface Usage {
  id: number;
  property_id: number;
  date_collected: string; // Stored as YYYY-MM-DD
  gallons: number;
  recorded_by_id: number;
  is_active: boolean;
}

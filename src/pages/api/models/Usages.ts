import Property from "./Properties";
import User from "./Users";

export default interface Usage {
  id: number;
  property_id: number;
  property?: Property; // Optional relationship
  date_collected: string; // Use ISO date format
  gallons: number;
  created_at: string;
  recorded_by_id: number;
  recorded_by?: User; // May be empty due to lazy fetch
  created_by_id: number;
  created_by?: User; // May be empty due to lazy fetch
  deleted_at?: string | null;
  deleted_by_id?: number | null;
  deleted_by?: User | null; // Optional relationship
}

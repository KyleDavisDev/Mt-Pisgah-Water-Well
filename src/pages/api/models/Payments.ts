import User from "./Users";
import Property from "./Properties";

export default interface Payment {
  id: number;
  amount_in_pennies: number;
  method: string;
  property_id: number;
  property?: Property; // Optional relationship
  created_at: string;
  created_by_id?: number | null;
  created_by?: User | null; // May be empty due to lazy fetch
  deleted_at?: string | null;
  deleted_by_id?: number | null;
  deleted_by?: User | null; // Optional relationship
  uuid: string;
}

import Homeowner from "./Homeowners";
import User from "./Users";

export default interface Property {
  id: number;
  address: string;
  description?: string | null;
  homeowner_id: number;
  homeowner?: Homeowner; // May be empty due to lazy fetch
  created_at: string;
  created_by_id: number;
  created_by?: User; // May be empty due to lazy fetch
  deleted_at?: string | null;
  deleted_by_id?: number | null;
  deleted_by?: User | null; // Optional relationship
  uuid: string;
}

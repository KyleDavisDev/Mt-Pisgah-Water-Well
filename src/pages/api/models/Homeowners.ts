import User from "./Users";

export default interface Homeowner {
  id: number;
  name: string;
  email?: string | null;
  phone_number?: string | null;
  mailing_address: string;
  created_at: string;
  deleted_at?: string | null;
  created_by_id: number;
  created_by?: User; // May be missing due to lazy-fetch
  deleted_by_id?: number | null;
  deleted_by?: User | null; // Optional relationship
}

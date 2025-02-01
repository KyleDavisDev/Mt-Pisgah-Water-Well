import User from "./Users";
import Permission from "./Permissions";

export default interface UserPermission {
  id: number;
  user_id: number;
  user?: User; // Optional relationship
  permission_id: number;
  permission?: Permission; // Optional relationship
  is_active: boolean;
  created_at: string;
}

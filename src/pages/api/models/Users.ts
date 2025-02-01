export default interface User {
  id: number;
  name: string;
  username: string;
  password: string;
  created_at: string; // ISO timestamp format
  modified_at: string; // ISO timestamp format
  is_active: boolean;
}

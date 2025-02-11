export default interface AuditLog {
  id: number;
  table_name: string;
  record_id: number;
  action_type: "INSERT" | "UPDATE" | "DELETE";
  old_data?: string | null;
  new_data?: string | null;
  action_by_id: number;
  action_timestamp: string; // ISO 8601 timestamp
  is_complete: boolean;
}

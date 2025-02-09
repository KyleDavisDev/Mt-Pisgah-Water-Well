export default interface AuditLog {
  id: number;
  table_name: string;
  record_id: number;
  action_type: "INSERT" | "UPDATE" | "DELETE";
  old_data?: Record<string, any> | null; // JSONB equivalent
  new_data?: Record<string, any> | null; // JSONB equivalent
  action_by_id: number;
  action_timestamp: string; // ISO 8601 timestamp
}

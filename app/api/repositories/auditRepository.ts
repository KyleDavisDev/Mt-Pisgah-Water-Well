import AuditLog from "../models/AuditLogs";
import { db } from "../utils/db";

type AuditTableInsertParams = {
  tableName: string;
  recordId: number;
  oldData?: string | null;
  newData?: string | null;
  actionBy: string;
  actionType: "INSERT" | "UPDATE" | "DELETE";
};

/**
 * Adds a record to the `audit_log` table to capture changes made to a specific table.
 *
 * @param {Object} params - The parameters for the audit log entry.
 * @param {string} params.tableName - The name of the database table being audited.
 * @param {number} params.recordId - The ID of the record that was affected.
 * @param {string | null | undefined} [params.oldData] - The previous state of the data (if applicable).
 * @param {string | null | undefined} [params.newData] - The new state of the data (if applicable).
 * @param {string} params.actionBy - The username of the user who performed the action.
 * @param {"INSERT" | "UPDATE" | "DELETE"} params.actionType - The type of action performed on the record.
 * @returns {Promise<AuditLog>} A promise that resolves with the inserted audit log record.
 * @throws {Error} Throws an error if the audit log insertion fails.
 */
export const addAuditTableRecord = async ({
  tableName,
  actionType,
  recordId,
  oldData,
  newData,
  actionBy
}: AuditTableInsertParams): Promise<AuditLog> => {
  try {
    const record = await db<AuditLog[]>`
        INSERT into audit_log (table_name, record_id, action_type, old_data, new_data, action_by_id, action_timestamp)
        VALUES (${tableName}, ${recordId}, ${actionType}, ${oldData ?? null}, ${newData ?? null},
                (SELECT id from users where username = ${actionBy}), now())

        returning *;
    `;

    if (!record) throw new Error("Audit log insertion failed: No record returned.");

    return record[0];
  } catch (e) {
    console.log("Unable to insert into audit_log table");
    throw new Error(`Could not insert audit_log record: ${e instanceof Error ? e.message : "Unknown error"}`);
  }
};

/**
 * Updates an existing record in the `audit_log` table.
 *
 * @param {AuditLog} auditLog - The updated audit log record to be saved.
 * @returns {Promise<AuditLog>} A promise that resolves with the updated audit log record.
 * @throws {Error} Throws an error if the audit log update fails.
 */
export const updateAuditTableRecord = async (auditLog: AuditLog): Promise<AuditLog> => {
  try {
    await db`
        UPDATE audit_log
        set table_name       = ${auditLog.table_name},
            record_id        = ${auditLog.record_id},
            action_type      = ${auditLog.action_type},
            old_data         = ${JSON.stringify(auditLog.old_data)},
            new_data         = ${JSON.stringify(auditLog.new_data)},
            action_by_id     = ${auditLog.action_by_id},
            action_timestamp = ${auditLog.action_timestamp}
        where id = ${auditLog.id}
    `;

    return auditLog;
  } catch (e) {
    console.log("Unable to update audit_log table");
    throw new Error(`Could not update audit_log record: ${e instanceof Error ? e.message : "Unknown error"}`);
  }
};

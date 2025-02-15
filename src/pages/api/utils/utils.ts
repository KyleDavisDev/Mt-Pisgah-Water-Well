import Users from "../models/Users";
import { db } from "../utils/db";
import jwt from "jsonwebtoken";
import AuditLog from "../models/AuditLogs";

const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;

export const safeParseStr = (str: string) => {
  try {
    const num = parseInt(str, 10); // Parse the string to an integer with base 10
    if (isNaN(num)) {
      return 0;
    }
    return num;
  } catch (error) {
    return 0;
  }
};

const getUser = async (username: string): Promise<Users> => {
  const results = await db.from("users").select().eq("username", username).limit(1);
  const data = results.data as Users[];

  if (data.length !== 1) {
    throw new Error("Invalid username or password.");
  }

  return data[0];
};

export const getUsernameFromCookie = async (jwtCookie: string | undefined): Promise<string> => {
  if (!jwtCookie) {
    throw new Error("Please re-login.");
  }
  const token = jwtCookie.split(" ")[0];
  if (!token) {
    throw new Error("Invalid token format");
  }
  const payload = jwt.verify(token, jwtPrivateKey as string);

  if (!payload) {
    throw new Error("Invalid token");
  }

  // @ts-ignore
  const username = payload.username;

  if (!username) {
    {
      throw new Error("Missing username");
    }
  }

  return username;
};

export const validatePermission = async (username: string, permission: string): Promise<void> => {
  const userPermissions = await db`
      SELECT count(*)
      FROM users u
               JOIN user_permissions up on u.id = up.user_id
               JOIN permissions p ON up.permission_id = p.id
      WHERE (p.value = ${permission} OR p.value = 'ADMIN')
        AND u.username = ${username}
        AND u.is_active = true
        AND up.is_active = true
        AND p.is_active = true
  `;

  if (userPermissions.length !== 1 || userPermissions[0].count === "0") {
    throw Error("User does not have sufficient privileges.");
  }

  return;
};

export const addAuditTableRecord = async ({
  tableName,
  actionType,
  recordId,
  oldData,
  newData,
  actionBy
}: {
  tableName: string;
  recordId: number;
  oldData?: string | null;
  newData?: string | null;
  actionBy: string;
  actionType: "INSERT" | "UPDATE" | "DELETE";
}): Promise<AuditLog> => {
  try {
    const record = await db<AuditLog[]>`
        INSERT into audit_log (table_name, record_id, action_type, old_data, new_data, action_by_id, action_timestamp)
            VALUES (${tableName}, ${recordId}, ${actionType}, ${oldData ?? null}, ${newData ?? null}, (SELECT id from users where username = ${actionBy}), now())
        
        returning *;
    `;

    if (!record) throw new Error("Audit log insertion failed: No record returned.");

    return record[0];
  } catch (e) {
    console.log("Unable to insert into audit_log table");
    throw new Error(`Could not insert audit_log record: ${e instanceof Error ? e.message : "Unknown error"}`);
  }
};

export const updateAuditTableRecord = async (auditLog: AuditLog): Promise<AuditLog> => {
  try {
    await db`
      UPDATE audit_log set table_name =${auditLog.table_name},
                           record_id =${auditLog.record_id},
                           action_type =${auditLog.action_type},
                           old_data =${JSON.stringify(auditLog.old_data)},
                           new_data =${JSON.stringify(auditLog.new_data)},
                           action_by_id =${auditLog.action_by_id},
                           action_timestamp =${auditLog.action_timestamp}
      where id=${auditLog.id}
    `;

    return auditLog;
  } catch (e) {
    console.log("Unable to update audit_log table");
    throw new Error(`Could not update audit_log record: ${e instanceof Error ? e.message : "Unknown error"}`);
  }
};

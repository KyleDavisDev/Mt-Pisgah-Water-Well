import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import Users from "../models/Users";
import { db } from "../utils/db";
import jwt from "jsonwebtoken";
import AuditLog from "../models/AuditLogs";
import User from "../models/Users";

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

/**
 * Retrieves a single user from the database by their username.
 *
 * @param username - The username of the user to retrieve.
 * @returns A promise that resolves to the matching user.
 * @throws An error if no user is found or if more than one user is returned.
 */
export const getUserByUsername = async (username: string): Promise<Users> => {
  if (username.trim().length === 0) {
    throw new Error("Invalid username provided.");
  }

  const users = await db<User[]>`
      SELECT *
      FROM users
      where username = ${username}
      LIMIT 1;
  `;

  if (users.length !== 1) {
    throw new Error(`User not found for username: ${username}`);
  }

  return users[0];
};

export const getUsernameFromCookie = async (jwtCookie: RequestCookie | undefined): Promise<string> => {
  if (!jwtCookie) {
    throw new Error("Please re-login.");
  }
  const token = jwtCookie.value.split(" ")[0];
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

/**
 * Extracts the client's IP address from a Next Request object, using common proxy headers.
 * Falls back to a default IP if not found. Also handles IPv4-mapped IPv6 addresses like "::ffff:127.0.0.1".
 *
 * @param request - The incoming Request object (e.g. from Next.js or Fetch API)
 * @returns A normalized IPv4 address as a string
 */
export const getClientIPFromRequest = (request: Request): string => {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";

  // Check the "x-forwarded-for" header first (may contain multiple comma-separated IPs)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const clientIp = forwardedFor.split(",")[0].trim();
    return normalizeIp(clientIp || FALLBACK_IP_ADDRESS);
  }

  // Fallback to "x-real-ip" header or default
  const realIp = request.headers.get("x-real-ip");
  return normalizeIp(realIp || FALLBACK_IP_ADDRESS);
};

/**
 * Converts IPv4-mapped IPv6 addresses (e.g. "::ffff:127.0.0.1") to plain IPv4 format.
 *
 * @param ip - The IP address string to normalize
 * @returns A simplified IPv4 address if applicable
 */
const normalizeIp = (ip: string): string => {
  return ip.startsWith("::ffff:") ? ip.replace("::ffff:", "") : ip;
};

/**
 * Extracts the User-Agent string from the incoming Next.js Request.
 *
 * @param request - The Next.js Request object
 * @returns The user agent string, or "unknown" if not available
 */
export const getUserAgentFromRequest = (request: Request): string => {
  return request.headers.get("user-agent") || "unknown";
};

export const extractKeyFromRequest = (request: Request, key: string): string[] | null => {
  const url = new URL(request.url);
  return url.searchParams.getAll(key);
};

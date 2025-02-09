import Users from "../models/Users";
import { db } from "../utils/db";
import jwt from "jsonwebtoken";

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
  return;

  // TODO: Lookup user permissions
  const userPermissions = await db
    .from("users")
    .select(
      `
    user_permissions (
      permissions (
        value
      )
    )
  `
    )
    .eq("users.username", username)
    .eq("users.isActive", true)
    .eq("users.user_permissions.isActive", true)
    .eq("users.user_permissions.permissions.isActive", true);
  // TODO: Check if provided permission exists in list

  return;
};

export const addInsertRecordToAuditTable = async ({
  tableName,
  recordId,
  data,
  actionBy
}: {
  tableName: string;
  recordId: string;
  data: string;
  actionBy: string;
}) => {
  try {
    await db`
    INSERT into audit_log (table_name, record_id, action_type, old_data, new_data, action_by_id, action_timestamp)
        VALUES (${tableName}, ${recordId}, 'INSERT', null, ${data}, (SELECT id from users where username = ${actionBy}), now())
  `;
  } catch (e) {
    console.log("Unable to insert into audit_log table");
  }
};

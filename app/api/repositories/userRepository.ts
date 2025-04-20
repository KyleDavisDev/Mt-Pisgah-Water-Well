import User from "../models/Users";
import { db } from "../utils/db";

/**
 * Retrieve users
 *
 * @returns Promise resolving to an array of User records
 */
export const getAllUsers = async (): Promise<User[]> => {
  const users = await db<User[]>`
      SELECT u.*
      FROM users u`;

  return users ?? [];
};

/**
 * Retrieve users by permission
 * @param permissions list of permissions to search for
 *
 * @returns Promise resolving to an array of User records
 */
export const getAllActiveUsersByPermission = async (permissions: string[]): Promise<User[]> => {
  const users = await db<User[]>`
      SELECT u.*
      FROM users u
               JOIN user_permissions up on u.id = up.user_id
               JOIN permissions p on up.permission_id = p.id
      WHERE up.is_active = true
        AND p.is_active = true
        AND u.is_active = true
        AND p.value in ${db(permissions)}`;

  return users ?? [];
};

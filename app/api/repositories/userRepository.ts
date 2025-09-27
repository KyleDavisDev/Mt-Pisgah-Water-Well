import User from "../models/Users";
import { db } from "../utils/db";

export class UserRepository {
  /**
   * Retrieve users
   *
   * @returns Promise resolving to an array of User records
   */
  static getAllUsers = async (): Promise<User[]> => {
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
  static getAllActiveUsersByPermission = async (permissions: string[]): Promise<User[]> => {
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

  /**
   * Retrieve active user by permission and username
   *
   * @param permission - The permission to check for
   * @param username - The username of the user to retrieve
   * @returns Promise resolving to User or null
   */
  static getActiveUserByPermissionAndUsername = async (permission: string, username: string): Promise<User | null> => {
    const users = await db<User[]>`
      SELECT u.*
      FROM users u
               JOIN user_permissions up on u.id = up.user_id
               JOIN permissions p ON up.permission_id = p.id
      WHERE (p.value = ${permission} OR p.value = 'ADMIN')
        AND u.username = ${username}
        AND u.is_active = true
        AND up.is_active = true
        AND p.is_active = true`;

    if (users.length !== 1) {
      return null;
    }

    return users[0];
  };

  /**
   * Retrieves a single user from the database by their username.
   *
   * @param username - The username of the user to retrieve.
   * @returns A promise that resolves to the matching user.
   * @throws An error if no user is found or if more than one user is returned.
   */
  static getUserByUsername = async (username: string): Promise<User> => {
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
}

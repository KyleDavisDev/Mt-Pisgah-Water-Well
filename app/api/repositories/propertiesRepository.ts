import { db } from "../utils/db";
import Property from "../models/Properties";

/**
 * Retrieves all active properties from the database.
 *
 * @returns Promise resolving to an array of Property records
 */
export const getAllActiveProperties = async (): Promise<Property[]> => {
  const properties = await db<Property[]>`
    SELECT * FROM properties
    WHERE is_active = true
  `;

  return properties ?? [];
};

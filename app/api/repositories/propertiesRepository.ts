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

/**
 * Retrieves all active properties from the database where the property belongs to a provided homeownerId
 * @param homeownerIds list of homeownerIds to search for
 *
 * @returns Promise resolving to an array of Property records
 */
export const getAllActivePropertiesByHomeownerIdIn = async (homeownerIds: number[]): Promise<Property[]> => {
  const properties = await db<Property[]>`
      SELECT *
      FROM properties
      WHERE homeowner_id IN ${db(homeownerIds)}
        AND is_active = true
  `;

  return properties ?? [];
};

/**
 * Retrieves a single property record from the database by the provided propertyId.
 * @param {number} propertyId - The ID of the property to search for.
 * @returns {Promise<Property | null>} A promise that resolves to a single Property record or null.
 */
export const getPropertyById = async (propertyId: number): Promise<Property | null> => {
  const property = await db<Property[]>`
      SELECT *
      FROM properties
      WHERE id = ${propertyId}
      limit 1;
  `;

  return property[0] ?? null;
};

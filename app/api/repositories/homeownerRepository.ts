import { db } from "../utils/db";
import Homeowner from "../models/Homeowners";

/**
 * Retrieves all active homeowners from the database.
 *
 * @returns Promise resolving to an array of Homeowner records
 */
export const getAllActiveHomeowners = async (): Promise<Homeowner[]> => {
  const homeowners = await db<Homeowner[]>`
    SELECT * FROM homeowners
    WHERE is_active = true
    ORDER BY id
  `;

  return homeowners ?? [];
};

/**
 * Retrieves a single active homeowner record based on the provided property ID.
 * @param {number} propertyId - The ID of the property to search for.
 * @returns {Promise<Homeowner | null>} A promise that resolves to a single Homeowner record or null.
 */
export const getHomeownerByPropertyId = async (propertyId: number): Promise<Homeowner> => {
  const homeowner = await db<Homeowner[]>`
      SELECT h.*
      FROM homeowners h
               JOIN properties p ON h.id = p.homeowner_id
      WHERE p.id = ${propertyId}
  `;

  return homeowner[0];
};

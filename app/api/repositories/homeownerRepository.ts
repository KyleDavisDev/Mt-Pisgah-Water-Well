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

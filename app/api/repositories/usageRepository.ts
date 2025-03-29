import Usage from "../models/Usages";
import { db } from "../utils/db";

export const getUsageById = async (id: string): Promise<Usage | null> => {
  const usages = await db<Usage[]>`
      SELECT *
      FROM usages
      where id = ${id}
  `;

  if (!usages || usages.length !== 1) {
    return null;
  }

  return usages[0];
};

/**
 * Retrieves the earliest active usage record per property within a given date range.
 *
 * @param start - Start date in YYYY-MM-DD format (inclusive)
 * @param end - End date in YYYY-MM-DD format (exclusive)
 * @param properties - Array of property IDs to filter on
 * @returns Promise resolving to an array of Usage records
 */
export const getFirstUsageByDateCollectedRangeAndPropertyIn = async (
  start: string,
  end: string,
  properties: number[]
): Promise<Usage[]> => {
  // Return early if no properties provided
  if (start === "" || end === "" || !properties || properties.length === 0) {
    return [];
  }

  const usages = await db<Usage[]>`
      SELECT DISTINCT ON (u.property_id) u.*
      FROM usages u
      WHERE u.date_collected >= ${start}
        AND u.date_collected < ${end}
        AND u.is_active = true
        AND u.property_id IN ${db(properties)}
      ORDER BY u.property_id, u.date_collected ASC
  `;

  return usages ?? [];
};

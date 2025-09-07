import Usage from "../models/Usages";
import { db } from "../utils/db";

export class UsageRepository {
  static getUsageById = async (id: string): Promise<Usage | null> => {
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
  static getFirstUsageByDateCollectedRangeAndPropertyIn = async (
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

  /**
   * Retrieves the most recent active usage records for each property ID, limited to `limit` per property.
   * @param propertyIds list of property IDs to filter by
   * @param limit the number of records to return per property
   *
   * @returns Promise resolving to an array of Usage records
   */
  static findAllActiveByPropertyIdInAndLimitBy = async (propertyIds: number[], limit: number): Promise<Usage[]> => {
    const usages = await db<Usage[]>`
    WITH usages_by_property AS (SELECT id,
                                  property_id,
                                  gallons,
                                  recorded_by_id,
                                  is_active,
                                  date_collected,
                                  ROW_NUMBER() OVER (
                                    PARTITION BY property_id
                                    ORDER BY date_collected DESC
                                    ) AS row_number
                           FROM usages
                           WHERE property_id IN ${db(propertyIds)}
                             AND is_active = true)
    SELECT id,
           property_id,
           gallons,
           recorded_by_id,
           is_active,
           TO_CHAR(date_collected, 'YYYY-MM-DD') AS date_collected
    FROM usages_by_property
    WHERE row_number <= ${limit}
    ORDER BY property_id, date_collected DESC;
  `;

    return usages ?? [];
  };
}

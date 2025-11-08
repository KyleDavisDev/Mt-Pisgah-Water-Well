import { db } from "../utils/db";
import { Discount } from "../models/Discount";

export class DiscountRepository {
  /**
   * Retrieves all active discounts.
   * @returns Promise resolving to an array of Discount records
   */
  static async getAllActiveDiscounts(): Promise<Discount[]> {
    const discounts = await db<Discount[]>`
      SELECT * FROM discounts
      WHERE is_active = true
      ORDER BY id
    `;
    return discounts ?? [];
  }

  /**
   * Retrieves a discount by its unique identifier.
   * @param id The unique identifier of the discount
   * @returns Promise resolving to the Discount record or null
   */
  static async getById(id: number): Promise<Discount | null> {
    const [discount] = await db<Discount[]>`
      SELECT * FROM discounts
      WHERE id = ${id}
      LIMIT 1
    `;
    return discount ?? null;
  }

  /**
   * Retrieves all discounts by name (case-insensitive).
   * @param name The name of the discount to search for
   * @returns Promise resolving to an array of Discount records
   */
  static async getByName(name: string): Promise<Discount[]> {
    const discounts = await db<Discount[]>`
      SELECT * FROM discounts
      WHERE LOWER(name) = LOWER(${name})
        AND is_active = true
      ORDER BY id
    `;
    return discounts ?? [];
  }

  /**
   * Retrieves all discounts for a given property by propertyId.
   * @param propertyId The unique identifier of the property
   * @returns Promise resolving to an array of Discount records
   */
  static async getByPropertyId(propertyId: number): Promise<Discount[]> {
    const discounts = await db<Discount[]>`
        SELECT d.*
        FROM discounts d
        INNER JOIN property_discounts pd ON pd.discount_id = d.id
        WHERE pd.property_id = ${propertyId}
          AND d.is_active = true
          AND pd.is_active = true
        ORDER BY d.id
      `;
    return discounts ?? [];
  }

  /**
   * Retrieves first discount for a given property by propertyId.
   * @param date The date for which the property discount applies to.
   * @param propertyId The unique identifier of the property
   * @returns Promise resolving to Discount record or null
   */
  static async getFirstActiveValidOnDateByPropertyId(date: string, propertyId: number): Promise<Discount | null> {
    const discounts = await db<Discount[]>`
        SELECT d.*
        FROM discounts d
        INNER JOIN property_discounts pd ON pd.discount_id = d.id
        WHERE pd.property_id = ${propertyId}
          AND d.is_active = true
          AND pd.is_active = true
        AND pd.valid_from <= ${date}
        AND pd.valid_to > ${date}
        LIMIT 1;
      `;
    return discounts ? discounts[0] : null;
  }
}

import { db } from "../utils/db";
import { PropertyDiscount } from "../models/PropertyDiscount";

export class propertyDiscountsRepository {
  /**
   * Retrieves all active property discounts.
   * @returns Promise resolving to an array of PropertyDiscount records
   */
  static async getAllActivePropertyDiscounts(): Promise<PropertyDiscount[]> {
    const discounts = await db<PropertyDiscount[]>`
      SELECT * FROM property_discounts
      WHERE is_active = true
      ORDER BY id
    `;
    return discounts ?? [];
  }

  /**
   * Retrieves all discounts for a given property ID.
   * @param propertyId The property ID to search for
   * @returns Promise resolving to an array of PropertyDiscount records
   */
  static async getByPropertyId(propertyId: number): Promise<PropertyDiscount[]> {
    const discounts = await db<PropertyDiscount[]>`
      SELECT * FROM property_discounts
      WHERE property_id = ${propertyId}
        AND is_active = true
      ORDER BY id
    `;
    return discounts ?? [];
  }

  /**
   * Retrieves all properties that have a given discount ID.
   * @param discountId The discount ID to search for
   * @returns Promise resolving to an array of PropertyDiscount records
   */
  static async getByDiscountId(discountId: number): Promise<PropertyDiscount[]> {
    const discounts = await db<PropertyDiscount[]>`
      SELECT * FROM property_discounts
      WHERE discount_id = ${discountId}
        AND is_active = true
      ORDER BY id
    `;
    return discounts ?? [];
  }

  /**
   * Retrieves a single property discount by its unique identifier.
   * @param id The unique identifier of the property discount
   * @returns Promise resolving to the PropertyDiscount record or null
   */
  static async getById(id: number): Promise<PropertyDiscount | null> {
    const [discount] = await db<PropertyDiscount[]>`
      SELECT * FROM property_discounts
      WHERE id = ${id}
      LIMIT 1
    `;
    return discount ?? null;
  }
}

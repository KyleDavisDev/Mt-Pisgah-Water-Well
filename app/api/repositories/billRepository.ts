import { db } from "../utils/db";
import UsageBill from "../models/UsageBill";

/**
 * Retrieves all usage bills for the given list of property IDs.
 *
 * @param propertyIds - An array of property IDs to filter by.
 * @returns A Promise resolving to an array of UsageBill records sorted by billing year and month (desc).
 */
export const getBillsByPropertyIds = async (propertyIds: number[]): Promise<UsageBill[]> => {
  if (!propertyIds || propertyIds.length === 0) return [];

  const bills = await db<UsageBill[]>`
    SELECT *
    FROM usage_bill
    WHERE property_id IN ${db(propertyIds)}
    ORDER BY billing_year DESC, billing_month DESC;
  `;

  return bills;
};

/**
 * Retrieves all active usage bills for a given year, month, and list of property IDs.
 *
 * @param {number} year - The 4-digit billing year (e.g., 2025).
 * @param {number} month - The billing month (1–12).
 * @param {number[]} propertyIds - List of property IDs to filter against.
 *
 * @returns {Promise<UsageBill[]>} A promise that resolves to an array of matching usage bills.
 */
export const getActiveUsageBillsForYearAndMonthAndPropertyIn = async (
  year: number,
  month: number,
  propertyIds: number[]
): Promise<UsageBill[]> => {
  if (!Array.isArray(propertyIds) || propertyIds.length === 0) return [];

  const bills = await db<UsageBill[]>`
      SELECT *
      FROM usage_bill
      WHERE billing_year = ${year}
        AND billing_month = ${month}
        AND is_active = true
        AND property_id IN ${db(propertyIds)}
  `;

  return bills ?? [];
};

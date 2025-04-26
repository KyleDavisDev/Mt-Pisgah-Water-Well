import { db } from "../utils/db";
import Invoice from "../models/Invoice";

/**
 * Retrieves all usage bills for the given list of property IDs.
 *
 * @param propertyIds - An array of property IDs to filter by.
 * @returns A Promise resolving to an array of UsageBill records sorted by billing year and month (desc).
 */
export const getInvoicesByPropertyIds = async (propertyIds: number[]): Promise<Invoice[]> => {
  if (!propertyIds || propertyIds.length === 0) return [];

  return db<Invoice[]>`
      SELECT *x
      FROM invoices
      WHERE property_id IN ${db(propertyIds)}
      ORDER BY billing_year DESC, billing_month DESC;
  `;
};

/**
 * Retrieves all active usage bills for a given year, month, and list of property IDs.
 *
 * @param {number} year - The 4-digit billing year (e.g., 2025).
 * @param {number} month - The billing month (1–12).
 * @param {number[]} propertyIds - List of property IDs to filter against.
 *
 * @returns {Promise<Invoice[]>} A promise that resolves to an array of matching usage bills.
 */
export const getActiveInvoiceByYearAndMonthAndPropertyIn = async (
  year: number,
  month: number,
  propertyIds: number[]
): Promise<Invoice[]> => {
  if (!Array.isArray(propertyIds) || propertyIds.length === 0) return [];

  const bills = await db<Invoice[]>`
      SELECT *
      FROM invoices
      WHERE billing_year = ${year}
        AND billing_month = ${month}
        AND is_active = true
        AND property_id IN ${db(propertyIds)}
  `;

  return bills ?? [];
};

/**
 * Retrieves a single usage bill by its unique identifier.
 *
 * @param {string} id - The unique identifier of the bill to retrieve.
 * @returns {Promise<Invoice | null>} A promise that resolves to the usage bill if found, or null if not found.
 */
export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
  if (!id) return null;

  const [bill] = await db<Invoice[]>`
      SELECT id,
             property_id,
             billing_month,
             billing_year,
             gallons_used,
             formula_used,
             amount_in_pennies,
             created_at,
             is_active
      FROM invoices
      WHERE id = ${id}
      LIMIT 1;
  `;

  return bill ?? null;
};

/**
 * Retrieves the most recent N active usage bills for a property,
 * on or before the specified billing month and year, ordered descending.
 *
 * @param {number} propertyId - The property ID to fetch usage bills for.
 * @param {number} limit - The maximum number of usage bills to retrieve.
 * @param {number} billingMonth - The cutoff billing month (1–12).
 * @param {number} billingYear - The cutoff billing year (e.g. 2025).
 * @returns {Promise<Invoice[]>} A promise that resolves to an array of usage bills.
 */
export const getRecentActiveInvoicesByPropertyBeforeBillingMonthYear = async (
  propertyId: number,
  limit: number,
  billingMonth: number,
  billingYear: number
): Promise<Invoice[]> => {
  if (!limit || limit <= 0 || billingMonth < 1 || billingMonth > 12 || billingYear < 0) return [];

  const bills = await db<Invoice[]>`
      SELECT *
      FROM invoices
      WHERE is_active = true
        AND property_id = ${propertyId}
        AND (
          billing_year < ${billingYear} OR
          (billing_year = ${billingYear} AND billing_month < ${billingMonth})
          )
      ORDER BY billing_year DESC, billing_month DESC
      LIMIT ${limit};
  `;

  return bills ?? [];
};

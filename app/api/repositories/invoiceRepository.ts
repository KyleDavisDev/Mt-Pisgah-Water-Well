import { db } from "../utils/db";
import Invoice, { InvoiceCreate, InvoiceTotal } from "../models/Invoice";
import { AuditRepository } from "./auditRepository";

export class InvoiceRepository {
  /**
   * Retrieves a single usage bill by its unique identifier.
   *
   * @param {string} id - The unique identifier of the bill to retrieve.
   * @returns {Promise<Invoice | null>} A promise that resolves to the usage bill if found, or null if not found.
   */
  static getInvoiceById = async (id: string): Promise<Invoice | null> => {
    if (!id) return null;

    const [bill] = await db<Invoice[]>`
    SELECT *
    FROM invoices
    WHERE id = ${id}
    LIMIT 1;
  `;

    return bill ?? null;
  };

  /**
   * Retrieves all usage bills for the given list of property IDs.
   *
   * @param propertyIds - An array of property IDs to filter by.
   * @param type - The type of usage bill to retrieve.
   * @returns A Promise resolving to an array of UsageBill records sorted by billing year and month (desc).
   */
  static getInvoicesByPropertyIdsAndType = async (propertyIds: number[], type: string): Promise<Invoice[]> => {
    if (!propertyIds || propertyIds.length === 0) return [];

    return db<Invoice[]>`
    SELECT *
    FROM invoices
    WHERE property_id IN ${db(propertyIds)}
      AND type = ${type}
      AND is_active = true
    ORDER BY (metadata ->> 'billing_year')::INT DESC,
             (metadata ->> 'billing_month')::INT DESC;
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
  static getActiveInvoiceByYearAndMonthAndPropertyIn = async (
    year: number,
    month: number,
    propertyIds: number[]
  ): Promise<Invoice[]> => {
    if (!Array.isArray(propertyIds) || propertyIds.length === 0) return [];

    const bills = await db<Invoice[]>`
    SELECT *
    FROM invoices
    WHERE type = 'WATER_USAGE'
      AND (metadata ->> 'billing_year')::INT = ${year}
      AND (metadata ->> 'billing_month')::INT = ${month}
      AND is_active = true
      AND property_id IN ${db(propertyIds)}
  `;

    return bills ?? [];
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
  static getRecentActiveWaterInvoicesByPropertyBeforeBillingMonthYear = async (
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
      AND type = 'WATER_USAGE'
      AND (
      (metadata ->> 'billing_year')::INT < ${billingYear} OR
      ((metadata ->> 'billing_year')::INT = ${billingYear} AND (metadata ->> 'billing_month')::INT < ${billingMonth})
      )
    ORDER BY (metadata ->> 'billing_year')::INT DESC, (metadata ->> 'billing_month')::INT DESC
    LIMIT ${limit};
  `;

    return bills ?? [];
  };

  static findActiveTotalByPropertyIds = async (propertyIds: number[]): Promise<InvoiceTotal[]> => {
    const payments = await db<InvoiceTotal[]>`
      SELECT property_id,
             COALESCE(SUM(i.amount_in_pennies), 0) AS amount_in_pennies
      FROM invoices i
      WHERE i.property_id IN ${db(propertyIds)}
      AND i.is_active = true
      GROUP BY i.property_id;
    `;

    return payments ?? [];
  };

  /**
   * Inserts a new invoice record into the database within a transactional context.
   *
   * @param {String} user - The user who is doing the inserting.
   * @param {InvoiceCreate} newData - The invoice data to insert.
   *
   * @returns {Promise<Invoice | null>} Resolves to the newly created invoice record.
   */
  static insertNewInvoiceAsTransactional = async (user: string, newData: InvoiceCreate): Promise<Invoice | null> => {
    const auditLog = await AuditRepository.addAuditTableRecord({
      tableName: "invoices",
      recordId: 0,
      newData: JSON.stringify(newData),
      actionBy: user,
      actionType: "INSERT"
    });

    if (!auditLog) return null;

    let savedInvoice: Invoice | null = null;
    await db.begin(async db => {
      const justInsertedInvoice = await db<Invoice[]>`
      INSERT INTO invoices (property_id,
                            amount_in_pennies,
                            type,
                            metadata,
                            is_active)
      VALUES (${newData.property_id},
              ${newData.amount_in_pennies},
              ${newData.type},
              ${db.json(newData.metadata)},
              ${newData.is_active})
      RETURNING *;
    `;

      await db`
      UPDATE audit_log
      SET is_complete = true,
          record_id   = ${justInsertedInvoice[0].id}
      WHERE id = ${auditLog.id};
    `;

      savedInvoice = justInsertedInvoice[0];
    });

    return savedInvoice;
  };

  /**
   * Inserts a new invoice record into the database within a transactional context.
   *
   * @param {String} user - The user who is doing the inserting.
   * @param {Invoice} oldData - The old invoice.
   * @param {Invoice} newData - The new invoice.
   *
   * @returns {Promise<Invoice | null>} Resolves to the newly created invoice record.
   */
  static updateInvoiceAsTransactional = async (
    user: string,
    oldData: Invoice,
    newData: Invoice
  ): Promise<Invoice | null> => {
    const auditLog = await AuditRepository.addAuditTableRecord({
      tableName: "invoices",
      recordId: oldData.id,
      oldData: JSON.stringify(oldData),
      newData: JSON.stringify(newData),
      actionBy: user,
      actionType: "UPDATE"
    });

    if (!auditLog) return null;

    await db.begin(async db => {
      await db`
      UPDATE invoices
      set is_active = ${newData.is_active}
      WHERE id = ${oldData.id};
    `;

      await db`
      UPDATE audit_log
      SET is_complete= true
      WHERE id = ${auditLog.id};
    `;
    });

    return newData;
  };
}

import { db } from "../utils/db";
import Bill, { BillCreate, BillTotal } from "../models/Bills";
import { AuditRepository } from "./auditRepository";
import Fee from "../models/Fee";
import { FeeRepository } from "./FeeRepository";

export class BillRepository {
  /**
   * Retrieves a single usage bill by its unique identifier.
   *
   * @param {string} id - The unique identifier of the bill to retrieve.
   * @returns {Promise<Bill | null>} A promise that resolves to the usage bill if found, or null if not found.
   */
  static getBillById = async (id: string): Promise<Bill | null> => {
    if (!id) return null;

    const [bill] = await db<Bill[]>`
      SELECT *
      FROM bills
      WHERE id = ${id}
      LIMIT 1;
    `;

    return bill ?? null;
  };

  /**
   * Retrieves all active usage bills for a given year, month, and list of property IDs.
   *
   * @param {number} year - The 4-digit billing year (e.g., 2025).
   * @param {number} month - The billing month (1–12).
   * @param {number[]} propertyIds - List of property IDs to filter against.
   *
   * @returns {Promise<Bill[]>} A promise that resolves to an array of matching usage bills.
   */
  static getActiveBillByYearAndMonthAndPropertyIn = async (
    year: number,
    month: number,
    propertyIds: number[]
  ): Promise<Bill[]> => {
    if (!Array.isArray(propertyIds) || propertyIds.length === 0) return [];

    const bills = await db<Bill[]>`
      SELECT *
      FROM bills
      WHERE billing_month = ${month}
        AND billing_year = ${year}
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
   * @returns {Promise<Bill[]>} A promise that resolves to an array of usage bills.
   */
  static getRecentActiveWaterBillsByPropertyBeforeBillingMonthYear = async (
    propertyId: number,
    limit: number,
    billingMonth: number,
    billingYear: number
  ): Promise<Bill[]> => {
    const bills = await db<Bill[]>`
      SELECT *
      FROM bills
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

  static findActiveTotalByPropertyIds = async (propertyIds: number[]): Promise<BillTotal[]> => {
    const payments = await db<BillTotal[]>`
      SELECT property_id,
             COALESCE(SUM(i.total_in_pennies), 0) AS total_in_pennies
      FROM bills i
      WHERE i.property_id IN ${db(propertyIds)}
      AND i.is_active = true
      GROUP BY i.property_id;
    `;

    return payments ?? [];
  };

  static findActiveTotalByPropertyIdsAndCreatedBefore = async (
    propertyIds: number[],
    createdBefore: string
  ): Promise<BillTotal[]> => {
    const payments = await db<BillTotal[]>`
      SELECT property_id,
             COALESCE(SUM(i.total_in_pennies), 0) AS total_in_pennies
      FROM bills i
      WHERE i.property_id IN ${db(propertyIds)}
        AND i.created_at < ${createdBefore}
        AND i.is_active = true
      GROUP BY i.property_id;
    `;

    return payments ?? [];
  };

  /**
   * Inserts a new bill record into the database within a transactional context.
   *
   * @param {String} user - The user who is doing the inserting.
   * @param {BillCreate} newData - The bill data to insert.
   * @param {Fee[]} fees - The fees to associate with the newly-created bill.
   *
   * @returns {Promise<Bill | null>} Resolves to the newly created bill record.
   */
  static insertNewBillAsTransactional = async (
    user: string,
    newData: BillCreate,
    fees: Fee[]
  ): Promise<Bill | null> => {
    const auditLog = await AuditRepository.addAuditTableRecord({
      tableName: "bills",
      recordId: 0,
      newData: JSON.stringify(newData),
      actionBy: user,
      actionType: "INSERT"
    });

    if (!auditLog) return null;

    let savedBill: Bill | null = null;
    await db.begin(async db => {
      const justInsertedBill = await db<Bill[]>`
      INSERT INTO bills (property_id,
                            total_in_pennies,
                            billing_month,
                            billing_year,
                            metadata,
                            is_active,
                            created_at)
      VALUES (${newData.property_id},
              ${newData.total_in_pennies},
              ${newData.billing_month},
              ${newData.billing_year},
              ${db.json(newData.metadata)},
              ${newData.is_active},
              ${newData.created_at})
      RETURNING *;
    `;

      await Promise.all(
        fees.map(async fee => {
          // Unable nest transactions and use FeeRepository.updateFeeAsTransactional so need to do this approach instead.
          const updatedFee = { ...fee, bill_id: justInsertedBill[0].id };

          const auditLog = await AuditRepository.addAuditTableRecord({
            tableName: "fees",
            recordId: fee.id,
            oldData: JSON.stringify(fee),
            newData: JSON.stringify(newData),
            actionBy: user,
            actionType: "UPDATE"
          });

          await db`
            UPDATE fees
            SET property_id = ${updatedFee.property_id},
                bill_id = ${updatedFee.bill_id},
                amount_in_pennies = ${updatedFee.amount_in_pennies},
                category = ${updatedFee.category},
                metadata = ${db.json(updatedFee.metadata)},
                is_active = ${updatedFee.is_active},
                created_at = ${updatedFee.created_at}
            WHERE id = ${fee.id};
          `;

          await db`
            UPDATE audit_log
            SET is_complete= true
            WHERE id = ${auditLog.id};
          `;
        })
      );

      await db`
      UPDATE audit_log
      SET is_complete = true,
          record_id   = ${justInsertedBill[0].id}
      WHERE id = ${auditLog.id};
    `;

      savedBill = justInsertedBill[0];
    });

    return savedBill;
  };

  /**
   * Inserts a new bill record into the database within a transactional context.
   *
   * @param {String} user - The user who is doing the inserting.
   * @param {Bill} oldData - The old bill.
   * @param {Bill} newData - The new bill.
   *
   * @returns {Promise<Bill | null>} Resolves to the newly created bill record.
   */
  static updateBillAsTransactional = async (user: string, oldData: Bill, newData: Bill): Promise<Bill | null> => {
    const auditLog = await AuditRepository.addAuditTableRecord({
      tableName: "bills",
      recordId: oldData.id,
      oldData: JSON.stringify(oldData),
      newData: JSON.stringify(newData),
      actionBy: user,
      actionType: "UPDATE"
    });

    if (!auditLog) return null;

    await db.begin(async db => {
      await db`
      UPDATE bills
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

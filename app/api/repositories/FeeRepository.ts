import { db } from "../utils/db";
import Fee, { FeeCreate, FeeTotal } from "../models/Fee";
import { AuditRepository } from "./auditRepository";
import { getAdjacentMonthRanges } from "../utils/utils";

export class FeeRepository {
  /**
   * Retrieves a single fee by its unique identifier.
   *
   * @param {string} id - The unique identifier of the fee to retrieve.
   * @returns {Promise<Fee | null>} A promise that resolves to the fee if found, or null if not found.
   */
  static getFeeById = async (id: string): Promise<Fee | null> => {
    if (!id) return null;

    const [fee] = await db<Fee[]>`
      SELECT *
      FROM fees
      WHERE id = ${id}
      LIMIT 1;
    `;

    return fee ?? null;
  };

  /**
   * Retrieves all fees for the given list of property IDs.
   *
   * @param propertyIds - An array of property IDs to filter by.
   * @param type - The type of fee to retrieve.
   * @returns A Promise resolving to an array of sorted (created_at desc) Fees.
   */
  static getFeesByPropertyIdsAndCategory = async (propertyIds: number[], category: string): Promise<Fee[]> => {
    if (!propertyIds || propertyIds.length === 0) return [];

    return db<Fee[]>`
      SELECT *
      FROM fees
      WHERE property_id IN ${db(propertyIds)}
        AND category = ${category}
        AND is_active = true
      ORDER BY created_at desc;
    `;
  };

  /**
   * Retrieves all active fees for a given year, month, and list of property IDs.
   *
   * @param {number} year - The 4-digit billing year (e.g., 2025).
   * @param {number} month - The billing month (1–12).
   * @param {number[]} propertyIds - List of property IDs to filter against.
   *
   * @returns {Promise<Fee[]>} A promise that resolves to an array of matching fees.
   */
  static getActiveFeesByYearAndMonthAndPropertyIn = async (
    year: number,
    month: number,
    propertyIds: number[]
  ): Promise<Fee[]> => {
    const { startOfCurrentMonth, startOfNextMonth } = getAdjacentMonthRanges(year.toString(10), month.toString(10));

    const fees = await db<Fee[]>`
      SELECT *
      FROM fees
      WHERE is_active = true
        AND property_id IN ${db(propertyIds)}
        AND created_at >= ${startOfCurrentMonth}
        AND created_at < ${startOfNextMonth}
      ORDER BY created_at desc
    `;

    return fees ?? [];
  };

  /**
   * Retrieves all active unbilled fees for a given year, month, and list of property IDs.
   *
   * @param {number} year - The 4-digit billing year (e.g., 2025).
   * @param {number} month - The billing month (1–12).
   * @param {number[]} propertyIds - List of property IDs to filter against.
   *
   * @returns {Promise<Fee[]>} A promise that resolves to an array of matching fees.
   */
  static getUnbilledActiveFeesByYearMonthAndPropertyIds = async (
    year: number,
    month: number,
    propertyIds: number[]
  ): Promise<Fee[]> => {
    const { startOfCurrentMonth, endOfCurrentMonth } = getAdjacentMonthRanges(year.toString(10), month.toString(10));

    const fees = await db<Fee[]>`
    SELECT *
    FROM fees
    WHERE is_active = true
      AND property_id IN ${db(propertyIds)}
      AND created_at >= ${startOfCurrentMonth}
      AND created_at < ${endOfCurrentMonth}
      AND bill_id IS NULL
    ORDER BY created_at desc
  `;

    return fees ?? [];
  };

  static findActiveTotalByPropertyIdsAndCreatedBefore = async (
    propertyIds: number[],
    createdBefore: string
  ): Promise<FeeTotal[]> => {
    const payments = await db<FeeTotal[]>`
      SELECT property_id,
             COALESCE(SUM(i.amount_in_pennies), 0) AS total_in_pennies
      FROM fees i
      WHERE i.property_id IN ${db(propertyIds)}
        AND i.created_at < ${createdBefore}
        AND i.is_active = true
      GROUP BY i.property_id;
    `;

    return payments ?? [];
  };

  /**
   * Inserts a new fee record into the database within a transactional context.
   *
   * @param {String} user - The user who is doing the inserting.
   * @param {FeeCreate} newData - The fee data to insert.
   *
   * @returns {Promise<Fee | null>} Resolves to the newly created fee record.
   */
  static insertNewFeeAsTransactional = async (user: string, newData: FeeCreate): Promise<Fee | null> => {
    const auditLog = await AuditRepository.addAuditTableRecord({
      tableName: "fees",
      recordId: 0,
      newData: JSON.stringify(newData),
      actionBy: user,
      actionType: "INSERT"
    });

    if (!auditLog) return null;

    let savedFee: Fee | null = null;
    await db.begin(async db => {
      const justInsertedFee = await db<Fee[]>`
      INSERT INTO fees (property_id,
                        bill_id,
                            amount_in_pennies,
                            category,
                            metadata,
                            is_active,
                            created_at)
      VALUES (${newData.property_id},
              ${newData.bill_id},
              ${newData.amount_in_pennies},
              ${newData.category},
              ${db.json(newData.metadata)},
              ${newData.is_active},
              ${newData.created_at})
      RETURNING *;
    `;

      await db`
      UPDATE audit_log
      SET is_complete = true,
          record_id   = ${justInsertedFee[0].id}
      WHERE id = ${auditLog.id};
    `;

      savedFee = justInsertedFee[0];
    });

    return savedFee;
  };

  /**
   * Inserts a new fee record into the database within a transactional context.
   *
   * @param {String} user - The user who is doing the inserting.
   * @param {Fee} oldData - The old fee.
   * @param {Fee} newData - The new fee.
   *
   * @returns {Promise<Fee | null>} Resolves to the newly created fee record.
   */
  static updateFeeAsTransactional = async (user: string, oldData: Fee, newData: Fee): Promise<Fee | null> => {
    const auditLog = await AuditRepository.addAuditTableRecord({
      tableName: "fees",
      recordId: oldData.id,
      oldData: JSON.stringify(oldData),
      newData: JSON.stringify(newData),
      actionBy: user,
      actionType: "UPDATE"
    });

    if (!auditLog) return null;

    await db.begin(async db => {
      await db`
      UPDATE fees
      SET property_id = ${newData.property_id},
          bill_id = ${newData.bill_id},
          amount_in_pennies = ${newData.amount_in_pennies},
          category = ${newData.category},
          metadata = ${db.json(newData.metadata)},
          is_active = ${newData.is_active},
          created_at = ${newData.created_at}
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

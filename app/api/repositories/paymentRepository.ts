import Payment, { PaymentCreate, PaymentTotal } from "../models/Payments";
import { db } from "../utils/db";
import { addAuditTableRecord } from "./auditRepository";

export class PaymentRepository {
  static async findActiveTotalByPropertyIds(propertyIds: number[]): Promise<PaymentTotal[]> {
    const payments = await db<PaymentTotal[]>`
      SELECT property_id,
             COALESCE(SUM(p.amount_in_pennies), 0) AS amount_in_pennies
      FROM payments p
      WHERE p.property_id IN ${db(propertyIds)}
        AND p.is_active = true
      GROUP BY p.property_id;
    `;

    return payments ?? [];
  }

  /**
   * Retrieves the most recent active payment records for each property ID, limited to `limit` per property.
   * @param propertyIds list of property IDs to filter by
   * @param limit the number of records to return per property
   *
   * @returns Promise resolving to an array of Payment records
   */
  static findAllActiveByPropertyIdInAndLimitBy = async (propertyIds: number[], limit: number): Promise<Payment[]> => {
    const usages = await db<Payment[]>`
    WITH payments_by_property AS (SELECT id,
                                  amount_in_pennies,
                                  method,
                                  property_id,
                                  created_at,
                                  is_active,
                                  ROW_NUMBER() OVER (
                                    PARTITION BY property_id
                                    ORDER BY created_at DESC
                                    ) AS row_number
                           FROM payments
                           WHERE property_id IN ${db(propertyIds)}
                             AND is_active = true)
    SELECT *
    FROM payments_by_property
    WHERE row_number <= ${limit}
    ORDER BY property_id, created_at DESC;
  `;

    return usages ?? [];
  };

  /**
   * Inserts new payment record within a transactional context.
   *
   * @param {String} user - The user who is doing the inserting.
   * @param {InvoiceCreate} record - The payment data to insert.
   *
   * @returns {Promise<Payment | null>} Resolves to the newly created payment record.
   */
  static insert = async (user: string, record: PaymentCreate): Promise<Payment | null> => {
    const auditLog = await addAuditTableRecord({
      tableName: "payments",
      recordId: 0,
      newData: JSON.stringify(record),
      actionBy: user,
      actionType: "INSERT"
    });

    if (!auditLog) return null;

    let savedPayment: Payment | null = null;
    await db.begin(async db => {
      const justInsertedPayment = await db<Payment[]>`
        INSERT INTO payments (amount_in_pennies,
                              method,
                              property_id,
                              is_active,
                              transaction_issued_by,
                              transaction_id)
        VALUES (${record.amount_in_pennies},
                ${record.method},
                ${record.property_id},
                ${true},
                null,
                null)
        RETURNING *;
      `;

      await db`
        UPDATE audit_log
        SET is_complete = true,
            record_id   = ${justInsertedPayment[0].id}
        WHERE id = ${auditLog.id};
      `;

      savedPayment = justInsertedPayment[0];
    });

    return savedPayment;
  };

  /**
   * Inserts new payment record within a transactional context.
   *
   * @param {String} user - The user who is doing the inserting.
   * @param {InvoiceCreate[]} records - The payment data to insert.
   *
   * @returns {Promise<Payment | null>} Resolves to the newly created payment record.
   */
  static insertMany = async (user: string, records: PaymentCreate[]): Promise<Payment[]> => {
    if (records.length === 0) return [];

    return Promise.allSettled(records.map(record => this.insert(user, record))).then(results => {
      const returnVal: Payment[] = [];
      results.forEach(res => {
        if (res.status === "fulfilled" && res.value) returnVal.push(res.value);
      });

      return returnVal;
    });
  };
}

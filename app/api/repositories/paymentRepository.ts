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

    let savedInvoice: Payment | null = null;
    await db.begin(async db => {
      const justInsertedInvoice = await db<Payment[]>`
        INSERT INTO payments (amount_in_pennies,
                              method,
                              property_id,
                              created_at,
                              is_active,
                              transaction_issued_by,
                              transaction_id)
        VALUES (${record.amount_in_pennies},
                ${record.method},
                ${record.property_id},
                ${record.created_at},
                ${true}, null, null)
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

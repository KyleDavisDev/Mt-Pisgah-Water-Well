import { PaymentTotal } from "../models/Payments";
import { db } from "../utils/db";

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
}

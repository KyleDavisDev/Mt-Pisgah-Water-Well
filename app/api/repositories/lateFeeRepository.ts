import { db } from "../utils/db";
import { LateFee } from "../models/LateFee";

/**
 * Returns all late fees associated with a given usage bill.
 */
export const getLateFeesByUsageBillId = async (billId: number): Promise<LateFee[]> => {
  const lateFees = await db<LateFee[]>`
      SELECT *
      FROM late_fees
      WHERE usage_bill_id = ${billId}
      ORDER BY created_at DESC;
  `;

  return lateFees ?? [];
};

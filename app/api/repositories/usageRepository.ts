import Usage from "../models/Usages";
import { db } from "../utils/db";

export const getUsageById = async (id: string): Promise<Usage | null> => {
  const usages = await db<Usage[]>`
        SELECT *
        FROM usages
        where id = ${id}
    `;

  if (!usages || usages.length !== 1) {
    return null;
  }

  return usages[0];
};

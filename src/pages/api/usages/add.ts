import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";
import { addAuditTableRecord, getUsernameFromCookie, validatePermission } from "../utils/utils";
import Usage from "../models/Usages";

type Data = {
  message?: string;
  error?: string;
};

const toModelAdapter = (usages: any): Usage[] => {
  if (!usages) throw Error("Could not map usages object");
  if (!Array.isArray(usages)) throw Error("Usages must be an array");

  return usages
    .filter((u: any) => {
      return !!u.dateCollected && !!u.gallons && !!u.id && !!u.recordedById;
    })
    .map((usage: any) => {
      return {
        id: 0, // Will be ignored in query
        date_collected: usage.dateCollected,
        gallons: usage.gallons,
        property_id: parseInt(usage.id, 10),
        recorded_by_id: parseInt(usage.recordedById, 10),
        is_active: true
      };
    });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    // Handle any other HTTP method
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const jwtCookie = req.cookies["jwt"];
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "ADD_USAGE");

    const { usages } = JSON.parse(req.body);

    // TODO: Data validation

    const sqlUsages = toModelAdapter(usages);

    for (let i = 0; i < sqlUsages.length; i++) {
      const auditRecord = await addAuditTableRecord({
        newData: JSON.stringify(sqlUsages[i]),
        recordId: 0, // will be updated later
        tableName: "usages",
        actionType: "INSERT",
        actionBy: username
      });

      try {
        await db.begin(async db => {
          const usage = await db`
            INSERT INTO usages ${db(sqlUsages[i], "date_collected", "gallons", "property_id", "recorded_by_id", "is_active")}
                returning *;
        `;

          await db`
            UPDATE audit_log
            SET is_complete= true,
                record_id  = ${usage[0].id}
            WHERE id = ${auditRecord.id};
        `;
        });
      } catch (e) {
        console.error("Failed to insert USAGE record", e);
      }
    }

    return res.status(200).json({ message: "Success!" });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Invalid username or password." });
  }

  return res.status(500).json({ error: "Something went wrong." });
}

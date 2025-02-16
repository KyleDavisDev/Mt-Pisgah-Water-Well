import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";
import { addAuditTableRecord, getUsernameFromCookie, updateAuditTableRecord, validatePermission } from "../utils/utils";
import Property from "../models/Properties";

type Data = {
  message?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === "POST") {
    try {
      const jwtCookie = req.cookies["jwt"];
      const username = await getUsernameFromCookie(jwtCookie);
      await validatePermission(username, "UPDATE_PROPERTY");

      const { description, id, isActive, homeownerId } = JSON.parse(req.body);

      // TODO: data validation

      // Find record to be edited
      const oldRecords = await db<Property[]>`
        SELECT * FROM properties where id = ${id}
      `;

      if (!oldRecords) {
        return res.status(400).json({ error: "Cannot find homeowners record" });
      }

      // Get new record data
      const newObj = { ...oldRecords[0], description, id, homeownerId, is_active: isActive === "true" };

      // log intent
      const auditRecord = await addAuditTableRecord({
        oldData: JSON.stringify(oldRecords[0]),
        newData: JSON.stringify(newObj),
        recordId: oldRecords[0].id,
        tableName: "properties",
        actionType: "UPDATE",
        actionBy: username
      });

      // Make update in a transaction
      await db.begin(async db => {
        await db`
            UPDATE properties
            SET description  = ${newObj.description},
                homeowner_id = ${homeownerId},
                is_active    = ${newObj.is_active}
            WHERE id = ${id};
        `;

        await db`
          UPDATE audit_log SET is_complete=true WHERE id = ${auditRecord.id};
        `;
      });

      return res.status(200).json({ message: "Success!" });
    } catch (error) {
      console.log(error);
      return res.status(403).json({ error: "Unable to update record." });
    }

    return res.status(500).json({ error: "Something went wrong." });
  } else {
    // Handle any other HTTP method
  }
  return res.status(400).json({ error: "Unsupported request type." });
}

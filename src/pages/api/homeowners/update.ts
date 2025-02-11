import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";
import { addAuditTableRecord, getUsernameFromCookie, updateAuditTableRecord, validatePermission } from "../utils/utils";
import Homeowner from "../models/Homeowners";

type Data = {
  message?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === "PUT") {
    try {
      const jwtCookie = req.cookies["jwt"];
      const username = await getUsernameFromCookie(jwtCookie);
      await validatePermission(username, "UPDATE_HOMEOWNER");

      const { name, email, phone, mailingAddress, id, isActive } = JSON.parse(req.body);

      // Find record to be edited
      const oldRecords = await db<Homeowner[]>`
        SELECT * FROM homeowners where id = ${id}
      `;

      if (!oldRecords) {
        return res.status(400).json({ error: "Cannot find homeowners record" });
      }

      // Get new record data
      const newObj = { ...oldRecords[0], name, email, phone, mailingAddress, id, is_active: isActive === "true" };

      // log intent
      const auditRecord = await addAuditTableRecord({
        oldData: JSON.stringify(oldRecords[0]),
        newData: JSON.stringify(newObj),
        recordId: oldRecords[0].id,
        tableName: "homeowners",
        actionType: "UPDATE",
        actionBy: username
      });

      // Make update
      await db`
          UPDATE homeowners SET name = ${newObj.name},
                                email = ${newObj.email},
                                phone_number = ${newObj.phone},
                                mailing_address = ${newObj.mailingAddress},
                                is_active = ${newObj.is_active}
          WHERE id = ${id};
      `;

      // Update intent log
      await updateAuditTableRecord({ ...auditRecord, is_complete: true });

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

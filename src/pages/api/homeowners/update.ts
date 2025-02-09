import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";
import { addAuditTableRecord, getUsernameFromCookie, validatePermission } from "../utils/utils";
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

      // Find record to be "edited"
      const oldRecords = await db<Homeowner[]>`
        SELECT * FROM homeowners where id = ${id}
      `;

      const updatedRecord = await db`
          UPDATE homeowners SET name = ${name}, email = ${email}, phone_number = ${phone}, mailing_address = ${mailingAddress},
                                is_active = ${isActive === "true"}
          WHERE id = ${id}
          returning *;
      `;

      await addAuditTableRecord({
        newData: JSON.stringify(updatedRecord[0]),
        oldData: JSON.stringify(oldRecords[0]),
        recordId: oldRecords[0].id,
        tableName: "homeowners",
        actionType: "UPDATE",
        actionBy: username
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

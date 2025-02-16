import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";
import { addAuditTableRecord, getUsernameFromCookie, updateAuditTableRecord, validatePermission } from "../utils/utils";

type Data = {
  message?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === "POST") {
    try {
      const jwtCookie = req.cookies["jwt"];
      const username = await getUsernameFromCookie(jwtCookie);
      await validatePermission(username, "ADD_HOMEOWNER");

      const { name, email, phone, mailingAddress } = JSON.parse(req.body);

      const auditLog = await addAuditTableRecord({
        tableName: "homeowners",
        recordId: 0, // will update
        newData: JSON.stringify({ name, email, phone, mailingAddress, is_active: true }),
        actionBy: username,
        actionType: "INSERT"
      });

      const record = await db`
        INSERT into homeowners (name, email, phone_number, mailing_address, is_active)
            values (${name}, ${email}, ${phone}, ${mailingAddress}, true)
        returning *;
      `;

      if (!record) {
        return res.status(500).json({ error: "Unable to insert new homeowners record" });
      }

      await updateAuditTableRecord({ ...auditLog, record_id: record[0].id, is_complete: true });

      return res.status(200).json({ message: "Success!" });
    } catch (error) {
      console.log(error);
      return res.status(403).json({ error: "Invalid username or password." });
    }

    return res.status(500).json({ error: "Something went wrong." });
  } else {
    // Handle any other HTTP method
  }
  return res.status(400).json({ error: "Unsupported request type." });
}

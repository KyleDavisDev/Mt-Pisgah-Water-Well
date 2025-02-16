import type { NextApiRequest } from "next";
import { cookies } from "next/headers";

import { db } from "../../utils/db";
import {
  addAuditTableRecord,
  getUsernameFromCookie,
  updateAuditTableRecord,
  validatePermission
} from "../../utils/utils";

export async function POST(req: NextApiRequest) {
  if (req.method !== "POST") {
    // Handle any other HTTP method

    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
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
      return new Response("Unable to insert new homeowners record", { status: 500 });
    }

    await updateAuditTableRecord({ ...auditLog, record_id: record[0].id, is_complete: true });

    return Response.json({ message: "Success!" });
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong.", { status: 500 });
  }

  return new Response("Something went wrong.", { status: 500 });
}

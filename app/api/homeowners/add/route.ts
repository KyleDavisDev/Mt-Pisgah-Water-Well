import { cookies } from "next/headers";

import { db } from "../../utils/db";
import {
  addAuditTableRecord,
  getUsernameFromCookie,
  updateAuditTableRecord,
  validatePermission
} from "../../utils/utils";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    if (!jwtCookie) {
      return new Response("Unauthorized", { status: 401 });
    }
    const username = await getUsernameFromCookie(jwtCookie);
    if (!username) {
      return new Response("Unauthorized", { status: 401 });
    }
    await validatePermission(username, "ADD_HOMEOWNER");

    const { name, email, phone, mailingAddress } = await req.json();

    if (!name || !email || !phone || !mailingAddress) {
      return new Response("Missing required fields", { status: 400 });
    }

    const auditLog = await addAuditTableRecord({
      tableName: "homeowners",
      recordId: 0, // will update
      newData: JSON.stringify({ name, email, phone, mailingAddress, is_active: true }),
      actionBy: username,
      actionType: "INSERT"
    });

    if (!auditLog) {
      return new Response("Unable to insert audit_log record", { status: 500 });
    }

    const record = await db`
        INSERT into homeowners (name, email, phone_number, mailing_address, is_active)
        values (${name}, ${email}, ${phone}, ${mailingAddress}, true)
        returning *;
    `;

    if (!record || !record[0].id) {
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

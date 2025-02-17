import { db } from "../../utils/db";
import {
  addAuditTableRecord,
  getUsernameFromCookie,
  updateAuditTableRecord,
  validatePermission
} from "../../utils/utils";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    // Handle any other HTTP method
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "ADD_PROPERTY");

    const { address, description, homeowner } = await req.json();

    // TODO: Data validation

    const auditLog = await addAuditTableRecord({
      tableName: "properties",
      recordId: 0, // will update
      newData: JSON.stringify({ address, description, homeowner, is_active: true }),
      actionBy: username,
      actionType: "INSERT"
    });

    const record = await db`
        INSERT into properties (address, description, homeowner_id, is_active)
        VALUES (${address}, ${description}, (SELECT id FROM homeowners where id = ${homeowner}), true)
        returning *;
    `;

    if (!record) {
      return new Response("Unable to insert new properties record", { status: 500 });
    }

    await updateAuditTableRecord({ ...auditLog, record_id: record[0].id, is_complete: true });

    return Response.json({ message: "Success!" });
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong.", { status: 500 });
  }

  return new Response("Something went wrong.", { status: 500 });
}

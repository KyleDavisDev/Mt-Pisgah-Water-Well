import { db } from "../../utils/db";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { cookies } from "next/headers";
import { addAuditTableRecord } from "../../repositories/auditRepository";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "ADD_PROPERTY");

    const { address, description, homeowner } = await req.json();

    if (!address || (description !== null && typeof description !== "string") || !homeowner) {
      return new Response("Missing required fields", { status: 400 });
    }

    const auditLog = await addAuditTableRecord({
      tableName: "properties",
      recordId: 0, // will update
      newData: JSON.stringify({ address, description, homeowner, is_active: true }),
      actionBy: username,
      actionType: "INSERT"
    });

    // Make update in a transaction
    await db.begin(async (db: any) => {
      const record = await db`
          INSERT into properties (address, description, homeowner_id, is_active)
          VALUES (${address}, ${description}, (SELECT id FROM homeowners where id = ${homeowner}), true)
          returning *;
      `;

      await db`
          UPDATE audit_log
          SET is_complete= true,
              record_id  = ${record[0].id}
          WHERE id = ${auditLog.id};
      `;
    });

    return Response.json({ message: "Success!" });
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong.", { status: 500 });
  }

  return new Response("Something went wrong.", { status: 500 });
}

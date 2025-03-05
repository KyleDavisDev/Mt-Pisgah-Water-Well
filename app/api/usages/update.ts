import { db } from "../utils/db";
import { addAuditTableRecord, getUsernameFromCookie, validatePermission } from "../utils/utils";
import { cookies } from "next/headers";
import { getUsageById } from "../repositories/usageRepository";

export async function PUT(req: Request) {
  if (req.method !== "PUT") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "UPDATE_USAGE");

    const { id, gallons, isActive } = await req.json();

    if (!id || !gallons || !isActive) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Find record to be edited
    const oldUsage = await getUsageById(id);
    if (!oldUsage) return new Response("Cannot find usage record", { status: 404 });

    // Get new record data
    const newUsage = { ...oldUsage, gallons, is_active: isActive === "true" };

    // log intent
    const auditRecord = await addAuditTableRecord({
      oldData: JSON.stringify(oldUsage),
      newData: JSON.stringify(newUsage),
      recordId: oldUsage.id,
      tableName: "usages",
      actionType: "UPDATE",
      actionBy: username
    });

    // Make update in a transaction
    await db.begin(async db => {
      await db`
          UPDATE usages
          SET gallons   = ${newUsage.gallons},
              is_active = ${newUsage.is_active}
          WHERE id = ${id};
      `;

      await db`
          UPDATE audit_log
          SET is_complete= true
          WHERE id = ${auditRecord.id};
      `;
    });

    return Response.json({ message: "Success!" });
  } catch (error) {
    console.log(error);
    return new Response("Invalid username or password.", { status: 403 });
  }

  return new Response("Something went wrong.", { status: 500 });
}

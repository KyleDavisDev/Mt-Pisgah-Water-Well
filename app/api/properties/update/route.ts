import { db } from "../../utils/db";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import Property from "../../models/Properties";
import { cookies } from "next/headers";
import { addAuditTableRecord } from "../../repositories/auditRepository";
import { getPropertyById } from "../../repositories/propertiesRepository";

export async function PUT(req: Request) {
  if (req.method !== "PUT") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "UPDATE_PROPERTY");

    const { description, id, isActive, homeownerId, street } = await req.json();

    if (!id || !homeownerId || !isActive || !street) {
      return new Response("Missing required fields", { status: 400 });
    }

    if (
      typeof description !== "string" ||
      typeof street !== "string" ||
      typeof id !== "number" ||
      typeof homeownerId !== "string" ||
      typeof isActive !== "string"
    ) {
      return new Response("Invalid field format", { status: 400 });
    }

    // Find record to be edited
    const oldRecord = await getPropertyById(id);

    if (!oldRecord) {
      return new Response("Cannot find property record", { status: 404 });
    }

    // Get new record data
    const newObj = { ...oldRecord, description, id, homeownerId, street, is_active: isActive === "true" };

    // TODO: move this to repository
    // log intent
    const auditRecord = await addAuditTableRecord({
      oldData: JSON.stringify(oldRecord),
      newData: JSON.stringify(newObj),
      recordId: oldRecord.id,
      tableName: "properties",
      actionType: "UPDATE",
      actionBy: username
    });

    // Make update in a transaction
    await db.begin(async (db: any) => {
      await db`
          UPDATE properties
          SET description  = ${newObj.description},
              homeowner_id = ${homeownerId},
              street      = ${street},
              is_active    = ${newObj.is_active}
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

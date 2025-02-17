import { db } from "../../utils/db";
import { addAuditTableRecord, getUsernameFromCookie, validatePermission } from "../../utils/utils";
import Homeowner from "../../models/Homeowners";
import { cookies } from "next/headers";

export async function PUT(req: Request) {
  if (req.method !== "PUT") {
    // Handle any other HTTP method
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "UPDATE_HOMEOWNER");

    const { name, email, phone, mailingAddress, id, isActive } = await req.json();

    // TODO: Data validation

    // Find record to be edited
    const oldRecords = await db<Homeowner[]>`
        SELECT *
        FROM homeowners
        where id = ${id}
    `;

    if (!oldRecords) {
      return new Response("Cannot find homeowners record", { status: 404 });
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

    // Make update in a transaction
    await db.begin(async db => {
      await db`
          UPDATE homeowners
          SET name            = ${newObj.name},
              email           = ${newObj.email},
              phone_number    = ${newObj.phone},
              mailing_address = ${newObj.mailingAddress},
              is_active       = ${newObj.is_active}
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

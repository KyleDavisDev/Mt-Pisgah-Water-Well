import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../utils/db";
import {
  addAuditTableRecord,
  getUsernameFromCookie,
  updateAuditTableRecord,
  validatePermission
} from "../../utils/utils";
import Property from "../../models/Properties";
import { cookies } from "next/headers";

type Data = {
  message?: string;
  error?: string;
};

export async function PUT(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    // Handle any other HTTP method
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "UPDATE_PROPERTY");

    // TODO: data validation
    const { description, id, isActive, homeownerId } = JSON.parse(req.body);

    // Find record to be edited
    const oldRecords = await db<Property[]>`
        SELECT *
        FROM properties
        where id = ${id}
    `;

    if (!oldRecords) {
      return res.status(400).json({ error: "Cannot find homeowners record" });
    }

    // Get new record data
    const newObj = { ...oldRecords[0], description, id, homeownerId, is_active: isActive === "true" };

    // log intent
    const auditRecord = await addAuditTableRecord({
      oldData: JSON.stringify(oldRecords[0]),
      newData: JSON.stringify(newObj),
      recordId: oldRecords[0].id,
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

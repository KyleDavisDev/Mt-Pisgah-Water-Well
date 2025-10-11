import { cookies } from "next/headers";
import { db } from "../../utils/db";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { AuditRepository } from "../../repositories/auditRepository";
import { withErrorHandler } from "../../utils/handlers";
import { BadRequestError } from "../../utils/errors";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request) => {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  const username = await getUsernameFromCookie(jwtCookie);
  await validatePermission(username, "ADD_PROPERTY");

  const { address, city, state, zip, description, homeowner } = await req.json();

  if (!address || (description !== null && typeof description !== "string") || !homeowner) {
    throw new BadRequestError("Missing required fields");
  }

  const auditLog = await AuditRepository.addAuditTableRecord({
    tableName: "properties",
    recordId: 0, // will update
    newData: JSON.stringify({ address, city, state, zip, description, homeowner, is_active: true }),
    actionBy: username,
    actionType: "INSERT"
  });

  // Make update in a transaction
  await db.begin(async (db: any) => {
    const record = await db`
          INSERT into properties (street, city, state, zip, description, homeowner_id, is_active)
          VALUES (${address}, ${city}, ${state}, ${zip}, ${description}, (SELECT id FROM homeowners where id = ${homeowner}), true)
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
};

export const POST = withErrorHandler(handler);

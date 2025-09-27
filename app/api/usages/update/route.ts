import { cookies } from "next/headers";
import { db } from "../../utils/db";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { UsageRepository } from "../../repositories/usageRepository";
import { AuditRepository } from "../../repositories/auditRepository";
import { ForbiddenError } from "../../utils/errors";
import { withErrorHandler } from "../../utils/handlers";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request) => {
  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "UPDATE_USAGE");

    const { id, gallons, isActive } = await req.json();

    if (!id || !gallons || !isActive) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Find record to be edited
    const oldUsage = await UsageRepository.getUsageById(id);
    if (!oldUsage) return new Response("Cannot find usage record", { status: 404 });

    // Get new record data
    const newUsage = { ...oldUsage, gallons, is_active: isActive === "true" };

    // log intent
    const auditRecord = await AuditRepository.addAuditTableRecord({
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
    throw new ForbiddenError("Invalid username or password.");
  }
};

export const PUT = withErrorHandler(handler);

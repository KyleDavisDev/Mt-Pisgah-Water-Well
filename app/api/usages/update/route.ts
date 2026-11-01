import { db } from "../../utils/db";
import { UsageRepository } from "../../repositories/usageRepository";
import { AuditRepository } from "../../repositories/auditRepository";
import { withAuthenticationHandler, withErrorHandler } from "../../utils/handlers";
import { BadRequestError, ResourceNotFoundError } from "../../utils/errors";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request, _ctx: unknown, username: string) => {
  const { id, gallons, isActive } = await req.json();

  if (!id || !gallons || !isActive) {
    throw new BadRequestError("Missing required fields");
  }

  // Find record to be edited
  const oldUsage = await UsageRepository.getUsageById(id);
  if (!oldUsage) throw new ResourceNotFoundError("Cannot find usage record");

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
};

export const PUT = withErrorHandler(withAuthenticationHandler(handler, ["UPDATE_USAGE"]));

import { db } from "../../utils/db";
import Usage from "../../models/Usages";
import { AuditRepository } from "../../repositories/auditRepository";
import { withAuthenticationHandler, withErrorHandler } from "../../utils/handlers";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const toModelAdapter = (usages: any): Usage[] => {
  if (!usages) throw Error("Could not map usages object");
  if (!Array.isArray(usages)) throw Error("Usages must be an array");

  return usages
    .filter((u: any) => {
      return !!u.dateCollected && !!u.gallons && !!u.id && !!u.recordedById;
    })
    .map((usage: any) => {
      return {
        id: 0, // Will be ignored in query
        date_collected: usage.dateCollected,
        gallons: usage.gallons,
        property_id: parseInt(usage.id, 10),
        recorded_by_id: parseInt(usage.recordedById, 10),
        is_active: true
      };
    });
};

const handler = async (req: Request, _ctx: unknown, username: string) => {
  // TODO: Data validation
  const { usages } = await req.json();

  const sqlUsages = toModelAdapter(usages);

  for (let i = 0; i < sqlUsages.length; i++) {
    const auditRecord = await AuditRepository.addAuditTableRecord({
      newData: JSON.stringify(sqlUsages[i]),
      recordId: 0, // will be updated later
      tableName: "usages",
      actionType: "INSERT",
      actionBy: username
    });

    try {
      await db.begin(async db => {
        const usage = await db`
            INSERT INTO usages ${db(sqlUsages[i], "date_collected", "gallons", "property_id", "recorded_by_id", "is_active")}
                returning *;
        `;

        await db`
            UPDATE audit_log
            SET is_complete= true,
                record_id  = ${usage[0].id}
            WHERE id = ${auditRecord.id};
        `;
      });
    } catch (e) {
      console.error("Failed to insert USAGE record", e);
    }
  }

  return Response.json({ message: "Success!" });
};

export const POST = withErrorHandler(withAuthenticationHandler(handler, ["ADD_USAGE"]));

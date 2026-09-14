import { db } from "../utils/db";
import { withAuthenticationHandler, withErrorHandler } from "../utils/handlers";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request, _ctx: unknown) => {
  const records = await db`
      SELECT prop.*, homeowner.name as name FROM properties prop
      JOIN homeowners homeowner on prop.homeowner_id = homeowner.id
      ORDER BY prop.id desc
    `;

  return Response.json({
    properties: records
      ? records.map(record => {
          return {
            street: record.street,
            description: record.description,
            isActive: record.is_active ? "true" : "false",
            id: record.id as string,
            homeowner: record.name
          };
        })
      : []
  });
};

export const GET = withErrorHandler(withAuthenticationHandler(handler, ["VIEW_PROPERTIES"]));

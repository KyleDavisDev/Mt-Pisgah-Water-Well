import { cookies } from "next/headers";
import { db } from "../utils/db";
import { getUsernameFromCookie, validatePermission } from "../utils/utils";
import { ForbiddenError, MethodNotAllowedError } from "../utils/errors";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (req.method !== "GET") {
    throw new MethodNotAllowedError();
  }

  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_PROPERTIES");

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
  } catch (error) {
    console.log(error);
    throw new ForbiddenError("Invalid username or password.");
  }
}

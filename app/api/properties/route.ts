import { cookies } from "next/headers";
import { db } from "../utils/db";
import { getUsernameFromCookie, validatePermission } from "../utils/utils";

// NextJS quirk to make the route dynamic
const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_PROPERTIES");

    const records = await db`
      SELECT prop.*, homeowner.name as name FROM properties prop
      JOIN homeowners homeowner on prop.homeowner_id = homeowner.id 
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
    return new Response("Invalid username or password.", { status: 403 });
  }

  return new Response("Something went wrong.", { status: 500 });
}

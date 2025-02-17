import { db } from "../utils/db";
import { getUsernameFromCookie, validatePermission } from "../utils/utils";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  if (req.method !== "GET") {
    // Handle any other HTTP method
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_PROPERTIES");

    const records = await db`
      SELECT prop.*, home.name as name FROM properties prop
      JOIN homeowners home on prop.homeowner_id = home.id 
    `;

    return Response.json({
      properties: records
        ? records.map(record => {
            return {
              address: record.address,
              description: record.description,
              isActive: record.is_active ? "true" : "false",
              id: record.id as string,
              // @ts-ignore
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

import { db } from "../utils/db";
import { extractKeyFromRequest, getUsernameFromCookie, validatePermission } from "../utils/utils";
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
    await validatePermission(username, "VIEW_USERS");

    const permissions = extractKeyFromRequest(req, "permissions");

    // TODO: Dynamic query

    let users;
    if (permissions) {
      users = await db`
          SELECT u.id, u.name
          FROM users u
                   JOIN user_permissions up on u.id = up.user_id
                   JOIN permissions p on up.permission_id = p.id
          WHERE up.is_active = true
            AND p.is_active = true
            AND u.is_active = true
            AND p.value in ${db(permissions)}
      `;
    } else {
      users = await db`
          SELECT u.id, u.name
          FROM users u
      `;
    }

    return Response.json({
      users: users.map(u => {
        return { id: u.id, name: u.name };
      })
    });
  } catch (e) {
    console.log(e);
    return new Response("Invalid username or password.", { status: 403 });
  }

  return new Response("Something went wrong.", { status: 500 });
}

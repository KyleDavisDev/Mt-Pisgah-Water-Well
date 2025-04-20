import { extractKeyFromRequest, getUsernameFromCookie, validatePermission } from "../utils/utils";
import { cookies } from "next/headers";
import { getAllActiveUsersByPermission, getAllUsers } from "../repositories/userRepository";

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
    // TODO: data validation of permissions

    const users = permissions ? await getAllActiveUsersByPermission(permissions) : await getAllUsers();

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

import { cookies } from "next/headers";
import { extractKeyFromRequest, getUsernameFromCookie, validatePermission } from "../utils/utils";
import { UserRepository } from "../repositories/userRepository";
import { ForbiddenError, MethodNotAllowedError } from "../utils/errors";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (req.method !== "GET") {
    // Handle any other HTTP method
    throw new MethodNotAllowedError();
  }

  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_USERS");

    const permissions = extractKeyFromRequest(req, "permissions");
    // TODO: data validation of permissions

    const users = permissions
      ? await UserRepository.getAllActiveUsersByPermission(permissions)
      : await UserRepository.getAllUsers();

    return Response.json({
      users: users.map(u => {
        return { id: u.id, name: u.name };
      })
    });
  } catch (e) {
    console.log(e);
    throw new ForbiddenError("Invalid username or password.");
  }
}

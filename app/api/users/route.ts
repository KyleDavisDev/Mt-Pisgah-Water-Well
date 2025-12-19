import { cookies } from "next/headers";
import { extractKeyFromRequest, getUsernameFromCookie, validatePermission } from "../utils/utils";
import { UserRepository } from "../repositories/userRepository";
import { withErrorHandler } from "../utils/handlers";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request) => {
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
};

export const GET = withErrorHandler(handler);

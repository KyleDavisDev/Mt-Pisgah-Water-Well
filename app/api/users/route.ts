import { extractKeyFromRequest } from "../utils/utils";
import { UserRepository } from "../repositories/userRepository";
import { withAuthenticationHandler, withErrorHandler } from "../utils/handlers";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request, _ctx: unknown) => {
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

export const GET = withErrorHandler(withAuthenticationHandler(handler, ["VIEW_USERS"]));

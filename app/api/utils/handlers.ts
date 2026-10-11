import { cookies } from "next/headers";
import { HttpError } from "./errors";
import { getUsernameFromCookie, validatePermission, validatePermissions } from "./utils";

type AsyncHandler = (...args: any[]) => Promise<any>;

export function withErrorHandler(handler: AsyncHandler): AsyncHandler {
  return async (...args) => {
    try {
      // Pass everything to the original handler
      return await handler(...args);
    } catch (err) {
      console.log(err);
      // Turn into a proper HTTP response
      if (err instanceof HttpError) {
        // For App Router we just return a Response
        return new Response(JSON.stringify({ error: err.message }), {
          status: err.status,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Anything else return default 400 error.
      console.error("Unexpected error in route handler:", err);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  };
}

export function withAuthenticationHandler(handler: AsyncHandler, requiredPermissions: string[]): AsyncHandler {
  return async (...args) => {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermissions(username, requiredPermissions);

    // Pass everything to the original handler
    return await handler(...args, username);
  };
}

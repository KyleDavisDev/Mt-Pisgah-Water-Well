import { cookies } from "next/headers";
import { withErrorHandler } from "../../utils/handlers";
import { InternalServerError } from "../../utils/errors";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (): Promise<Response> => {
  try {
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("jwt", "", {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0
    });

    return Response.json({ message: "Logged out" });
  } catch (error) {
    console.error("logout error:", error);
    throw new InternalServerError("Unexpected error during logout.");
  }
};

export const POST = withErrorHandler(handler);

import { cookies } from "next/headers";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
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
    return new Response("Unexpected error during logout.", { status: 500 });
  }
}

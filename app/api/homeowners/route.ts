import { cookies } from "next/headers";
import { db } from "../utils/db";
import Homeowners from "../models/Homeowners";
import { getUsernameFromCookie, validatePermission } from "../utils/utils";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (req.method !== "GET") {
    // Handle any other HTTP method
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_HOMEOWNERS");

    const homeowners = await db<Homeowners[]>`
        SELECT *
        FROM homeowners
        ORDER BY name DESC;
    `;

    return Response.json({
      homeowners: homeowners.map(h => {
        return {
          name: h.name,
          id: h.id.toString(),
          email: h.email,
          phone: h.phone_number,
          mailingAddress: h.mailing_address,
          isActive: h.is_active ? "true" : "false"
        };
      })
    });
  } catch (error) {
    console.log(error);
    return new Response("Invalid username or password.", { status: 403 });
  }

  return new Response("Something went wrong.", { status: 500 });
}

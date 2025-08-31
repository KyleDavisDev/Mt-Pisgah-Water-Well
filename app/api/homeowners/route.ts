import { cookies } from "next/headers";
import { db } from "../utils/db";
import Homeowners from "../models/Homeowners";
import { getUsernameFromCookie, validatePermission } from "../utils/utils";
import { withErrorHandler } from "../utils/handlers";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request) => {
  if (req.method !== "GET") {
    // Handle any other HTTP method
    return new Response("Method Not Allowed", { status: 405 });
  }

  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  const username = await getUsernameFromCookie(jwtCookie);
  await validatePermission(username, "VIEW_HOMEOWNERS");

  const homeowners = await db<Homeowners[]>`
        SELECT *
        FROM homeowners
        ORDER BY name ASC;
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
};

export const GET = withErrorHandler(handler);

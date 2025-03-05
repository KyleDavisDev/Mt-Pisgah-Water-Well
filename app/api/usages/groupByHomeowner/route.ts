import { db } from "../../utils/db";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import Homeowners from "../../models/Homeowners";
import Property from "../../models/Properties";
import Usages from "../../models/Usages";
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
    await validatePermission(username, "VIEW_USAGES");

    const homeowners = await db<Homeowners[]>`
        SELECT homeowner.id, homeowner.name, homeowner.is_active
        FROM homeowners homeowner
        WHERE homeowner.is_active = true
        ORDER BY homeowner.id
    `;

    if (!homeowners || homeowners.length === 0) {
      return Response.json({ homeowners: [] });
    }

    // Fetch properties in a single query for all homeowners
    const homeownerIds = homeowners.map(h => h.id);
    const properties = await db<Property[]>`
        SELECT *
        FROM properties
        WHERE homeowner_id IN ${db(homeownerIds)}
          AND is_active = true
    `;

    if (!properties || properties.length === 0) {
      return Response.json({
        homeowners: homeowners.map(h => ({ id: h.id.toString(), name: h.name, properties: [] }))
      });
    }

    // Fetch latest usages for all properties in a single query
    const propertyIds = properties.map(p => p.id);
    const usages = await db<Usages[]>`
        SELECT *
        FROM usages
        WHERE property_id IN ${db(propertyIds)}
          AND is_active = true
        ORDER BY property_id, date_collected DESC
    `;

    const returnData = homeowners.map((homeowner: Homeowners) => {
      return {
        id: homeowner.id.toString(),
        name: homeowner.name,
        properties: properties
          .filter((p: Property) => p.homeowner_id === homeowner.id)
          .map((p: Property) => {
            return {
              id: p.id.toString(),
              address: p.address,
              description: p.description,
              usages: usages
                .filter((u: Usages) => u.property_id === p.id)
                .map((u: Usages) => ({
                  id: u.id.toString(),
                  gallons: u.gallons.toString(),
                  dateCollected: u.date_collected,
                  isActive: u.is_active.toString()
                }))
            };
          })
      };
    });

    return Response.json({
      homeowners: returnData
    });
  } catch (error) {
    console.log(error);
    return new Response("Invalid username or password.", { status: 403 });
  }

  return new Response("Something went wrong.", { status: 500 });
}

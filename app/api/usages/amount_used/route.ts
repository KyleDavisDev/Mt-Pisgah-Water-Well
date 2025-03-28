import { db } from "../../utils/db";
import { extractKeyFromRequest, getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { cookies } from "next/headers";
import Usage from "../../models/Usages";
import Homeowner from "../../models/Homeowners";
import Property from "../../models/Properties";

const formatMonth = (month: number): string => {
  if (month < 0) return "00";
  if (month < 9) return "0" + month.toString();
  if (month < 13) return month.toString();
  return "01";
};

export async function GET(req: Request) {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_USAGES");

    const month = extractKeyFromRequest(req, "month");
    const year = extractKeyFromRequest(req, "year");

    if (!month || !year) {
      return new Response("Missing 'month' or 'year' query parameter", { status: 400 });
    }

    if (month.length > 1 || year.length > 1) {
      return new Response("'month' and 'year' cannot be arrays", { status: 400 });
    }

    const startOfMonth = `${year[0]}-${month[0]}-01`;
    const endOfMonth = `${year[0]}-${month[0]}-28`;
    const nextMonth = parseInt(month[0], 10) + 1;

    const formattedNextMonth = formatMonth(nextMonth);
    const startOfNextMonth = `${nextMonth < 13 ? year[0] : (parseInt(year[0], 10) + 1).toString()}-${formattedNextMonth}-01`;
    const endOfNextMonth = startOfNextMonth.substring(0, 8) + "28";

    console.log(startOfMonth, endOfMonth, startOfNextMonth, endOfNextMonth);

    const homeowners = await db<Homeowner[]>`
        SELECT homeowner.id, homeowner.name, homeowner.is_active
        FROM homeowners homeowner
        WHERE homeowner.is_active = true
        ORDER BY homeowner.id
    `;

    const properties = await db<Property[]>`
        SELECT *
        FROM properties
        WHERE homeowner_id IN ${db(homeowners.map(h => h.id))}
          AND is_active = true
    `;

    // First usage of the month
    const startingUsage = await db<Usage[]>`
        SELECT DISTINCT ON (u.property_id) u.property_id, u.gallons
        FROM usages u
        WHERE u.date_collected >= ${startOfMonth}
          AND u.date_collected < ${endOfMonth}
          AND u.is_active = true
          AND u.property_id IN ${db(properties.map(p => p.id))}
        ORDER BY u.property_id, u.date_collected ASC
    `;

    // Find the first usage of the next month
    const endingUsage = await db<Usage[]>`
        SELECT DISTINCT ON (u.property_id) u.property_id, u.gallons
        FROM usages u
        WHERE u.date_collected >= ${startOfNextMonth}
          AND u.date_collected < ${endOfNextMonth}
          AND u.is_active = true
          AND u.property_id IN ${db(properties.map(p => p.id))}
        ORDER BY u.property_id, u.date_collected ASC
    `;

    console.log(startingUsage);

    const returnData = homeowners
      .filter(h => {
        return properties.some(p => p.homeowner_id === h.id);
      })
      .map(homeowner => {
        return {
          id: homeowner.id.toString(),
          name: homeowner.name,
          properties: properties
            .filter(p => p.homeowner_id === homeowner.id)
            .map(p => {
              const firstUsage = startingUsage.find(f => f.property_id === p.id);
              const lastUsage = endingUsage.find(l => l.property_id === p.id);

              return {
                id: p.id.toString(),
                address: p.address,
                description: p.description,
                startingGallons: firstUsage ? firstUsage.gallons : "--",
                endingGallons: lastUsage ? lastUsage.gallons : "--",
                gallonsUsed: lastUsage && firstUsage ? lastUsage.gallons - firstUsage.gallons : "--"
              };
            })
        };
      });

    return Response.json({
      homeowners: returnData
    });
  } catch (error) {
    console.error("Error generating usage bill:", error);
    return new Response("Invalid username or password.", { status: 403 });
  }

  return new Response("Something went wrong.", { status: 500 });
}

import { db } from "../../utils/db";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { cookies } from "next/headers";
import Usage from "../../models/Usages";
import Homeowner from "../../models/Homeowners";
import Property from "../../models/Properties";

const extractKeyFromQuery = (request: Request, key: string): string[] | null => {
  const url = new URL(request.url);
  return url.searchParams.getAll(key);
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

    const month = extractKeyFromQuery(req, "month");
    const year = extractKeyFromQuery(req, "year");

    if (!month || !year) {
      return new Response("Missing 'month' or 'year' query parameter", { status: 400 });
    }

    if (month.length > 1 || year.length > 1) {
      return new Response("'month' and 'year' cannot be arrays", { status: 400 });
    }

    const startOfMonth = `${year[0]}-${month[0]}-01`;
    const endOfMonth = `${year[0]}-${month[0]}-28`;

    console.log(startOfMonth, endOfMonth);

    // First usage of the month
    const firstUsages = await db<Usage[]>`
        SELECT DISTINCT ON (u.property_id)
            u.property_id,
            u.gallons
        FROM usages u
        WHERE u.date_collected >= ${startOfMonth}
          AND u.date_collected < ${endOfMonth}
          AND u.is_active = true
        ORDER BY u.property_id, u.date_collected ASC
    `;

    // Last usage of the month
    const lastUsages = await db<Usage[]>`
        SELECT DISTINCT ON (u.property_id) u.property_id, u.gallons
        FROM usages u
        WHERE u.date_collected >= ${endOfMonth}
          AND u.is_active = true
        ORDER BY u.property_id, u.date_collected ASC
    `;

    console.log(firstUsages, lastUsages);

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

    const returnData = homeowners.map(homeowner => {
      return {
        id: homeowner.id.toString(),
        name: homeowner.name,
        properties: properties
          .filter(p => p.homeowner_id === homeowner.id)
          .map(p => {
            const firstUsage = firstUsages.find(f => f.property_id === p.id);
            const lastUsage = lastUsages.find(l => l.property_id === p.id);

            if (!firstUsage || !lastUsage) {
              return {
                id: p.id.toString(),
                address: p.address,
                description: p.description,
                startingGallons: 0,
                endingGallons: 0,
                gallonsUsed: 0
              };
            }

            return {
              id: p.id.toString(),
              address: p.address,
              description: p.description,
              startingGallons: firstUsage.gallons,
              endingGallons: lastUsage.gallons,
              gallonsUsed: lastUsage.gallons - firstUsage.gallons
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

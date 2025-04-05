import {
  extractKeyFromRequest,
  getStartAndEndOfProvidedMonthAndNextMonth,
  getUsernameFromCookie,
  validatePermission
} from "../../utils/utils";
import { cookies } from "next/headers";
import { getFirstUsageByDateCollectedRangeAndPropertyIn } from "../../repositories/usageRepository";
import { getAllActiveProperties } from "../../repositories/propertiesRepository";
import { getAllActiveHomeowners } from "../../repositories/homeownerRepository";

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

    const { startOfMonth, endOfMonth, startOfNextMonth, endOfNextMonth } = getStartAndEndOfProvidedMonthAndNextMonth(
      year[0],
      month[0]
    );

    const properties = await getAllActiveProperties();
    const propertyIds = properties.map((p: any) => p.id);

    const startingUsages = await getFirstUsageByDateCollectedRangeAndPropertyIn(startOfMonth, endOfMonth, propertyIds);
    const endingUsages = await getFirstUsageByDateCollectedRangeAndPropertyIn(
      startOfNextMonth,
      endOfNextMonth,
      propertyIds
    );

    const homeowners = await getAllActiveHomeowners();
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
              const firstUsage = startingUsages.find(f => f.property_id === p.id);
              const lastUsage = endingUsages.find(l => l.property_id === p.id);

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

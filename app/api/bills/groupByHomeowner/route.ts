import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import Homeowners from "../../models/Homeowners";
import Property from "../../models/Properties";
import { cookies } from "next/headers";
import { getAllActiveHomeowners } from "../../repositories/homeownerRepository";
import { getAllActivePropertiesByHomeownerIdIn } from "../../repositories/propertiesRepository";
import { getBillsByPropertyIds } from "../../repositories/billRepository";
import UsageBill from "../../models/UsageBill";

export async function GET(req: Request) {
  if (req.method !== "GET") {
    // Handle any other HTTP method
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_BILLS");

    const homeowners = await getAllActiveHomeowners();
    if (!homeowners || homeowners.length === 0) {
      return Response.json({ homeowners: [] });
    }

    // Fetch properties for all homeowners
    const homeownerIds = homeowners.map(h => h.id);
    const properties = await getAllActivePropertiesByHomeownerIdIn(homeownerIds);
    if (!properties || properties.length === 0) {
      return Response.json({
        homeowners: homeowners.map(h => ({ id: h.id.toString(), name: h.name, properties: [] }))
      });
    }

    // Fetch latest usages for all properties in a single query
    const propertyIds = properties.map(p => p.id);
    const bills = await getBillsByPropertyIds(propertyIds);

    const returnData = homeowners
      .filter((homeowner: Homeowners) => {
        return properties.some(property => property.homeowner_id === homeowner.id);
      })
      .map((homeowner: Homeowners) => {
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
                bills: bills
                  .filter((u: UsageBill) => u.property_id === p.id)
                  .map((u: UsageBill) => {
                    return {
                      id: u.id.toString(),
                      gallonsUsed: u.gallons_used.toString(),
                      dateCreated: "2025-01-01",
                      amountInPennies: u.amount_in_pennies,
                      isActive: u.is_active.toString()
                    };
                  })
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

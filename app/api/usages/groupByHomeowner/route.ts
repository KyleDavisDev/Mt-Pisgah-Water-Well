import { cookies } from "next/headers";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import Homeowners from "../../models/Homeowners";
import Property from "../../models/Properties";
import Usages from "../../models/Usages";
import { UsageRepository } from "../../repositories/usageRepository";
import { HomeownerRepository } from "../../repositories/homeownerRepository";
import { PropertyRepository } from "../../repositories/propertyRepository";
import { ForbiddenError, MethodNotAllowedError } from "../../utils/errors";
import { withErrorHandler } from "../../utils/handlers";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request) => {
  if (req.method !== "GET") {
    // Handle any other HTTP method
    throw new MethodNotAllowedError();
  }

  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_USAGES");

    const homeowners = await HomeownerRepository.getAllActiveHomeowners();
    if (!homeowners || homeowners.length === 0) {
      return Response.json({ homeowners: [] });
    }

    // Fetch properties for all homeowners
    const homeownerIds = homeowners.map(h => h.id);
    const properties = await PropertyRepository.getAllActivePropertiesByHomeownerIdIn(homeownerIds);
    if (!properties || properties.length === 0) {
      return Response.json({
        homeowners: homeowners.map(h => ({ id: h.id.toString(), name: h.name, properties: [] }))
      });
    }

    // Fetch latest usages for all properties in a single query
    const propertyIds = properties.map(p => p.id);
    const usages = await UsageRepository.findAllActiveByPropertyIdInAndLimitBy(propertyIds, 6);

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
                address: p.street,
                description: p.description,
                usages: usages
                  .filter((u: Usages) => u.property_id === p.id)
                  .map((u: Usages) => {
                    return {
                      id: u.id.toString(),
                      gallons: u.gallons.toString(),
                      dateCollected: u.date_collected,
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
    throw new ForbiddenError("Invalid username or password.");
  }
};

export const GET = withErrorHandler(handler);

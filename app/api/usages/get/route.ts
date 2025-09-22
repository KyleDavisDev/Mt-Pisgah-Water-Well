import { cookies } from "next/headers";
import { extractKeyFromRequest, getUsernameFromCookie, validatePermission } from "../../utils/utils";
import Homeowners from "../../models/Homeowners";
import Property from "../../models/Properties";
import Usages from "../../models/Usages";
import { UsageRepository } from "../../repositories/usageRepository";
import { HomeownerRepository } from "../../repositories/homeownerRepository";
import { PropertyRepository } from "../../repositories/propertyRepository";
import Usage from "../../models/Usages";
import Homeowner from "../../models/Homeowners";
import { ForbiddenError, MethodNotAllowedError } from "../../utils/errors";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const homeownerGrouping = (homeowners: Homeowner[], properties: Property[], usages: Usage[]) => {
  return Response.json({
    homeowners: homeowners
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
      })
  });
};

const walkableGrouping = (homeowners: Homeowner[], properties: Property[], usages: Usage[]) => {
  let unsortedProperties = properties.map(p => {
    return {
      id: p.id.toString(),
      address: p.street,
      description: p.description,
      homeowner: homeowners
        .filter(h => h.id === p.homeowner_id)
        .map(h => {
          return { id: h.id.toString(), name: h.name };
        })[0],
      usages: usages
        .filter(u => u.property_id === p.id)
        .map(u => {
          return {
            id: u.id.toString(),
            gallons: u.gallons.toString(),
            dateCollected: u.date_collected,
            isActive: u.is_active.toString()
          };
        })
    };
  });

  const customOrder = ["5", "6", "7", "1", "2", "3", "9", "10", "11", "16", "8", "12", "4", "13", "14", "15"];

  const sortedProperties = unsortedProperties.sort((a, b) => {
    const indexA = customOrder.indexOf(a.id);
    const indexB = customOrder.indexOf(b.id);

    // Handle items not in custom order
    const priorityA = indexA === -1 ? Infinity : indexA;
    const priorityB = indexB === -1 ? Infinity : indexB;

    return priorityA - priorityB;
  });

  return Response.json({
    properties: sortedProperties
  });
};

const defaultGrouping = (homeowners: Homeowner[], properties: Property[], usages: Usage[]) => {
  return Response.json({
    usages: usages.map(usage => {
      return {
        id: usage.id.toString(),
        gallons: usage.gallons.toString(),
        dateCollected: usage.date_collected,
        isActive: usage.is_active.toString(),
        property: properties
          .filter(p => p.id === usage.property_id)
          .map(p => {
            return {
              id: p.id.toString(),
              address: p.street,
              description: p.description,
              homeowner: homeowners
                .filter(h => h.id === p.id)
                .map(h => {
                  return { id: h.id.toString(), name: h.name };
                })[0]
            };
          })[0]
      };
    })
  });
};

export async function GET(req: Request) {
  if (req.method !== "GET") {
    // Handle any other HTTP method
    throw new MethodNotAllowedError();
  }

  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_USAGES");

    const groupBy = extractKeyFromRequest(req, "groupBy");

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
    const usages = await UsageRepository.findAllActiveByPropertyIdInAndLimitBy(propertyIds, 100);

    if (groupBy?.length === 1 && groupBy[0] === "HOMEOWNER") {
      return homeownerGrouping(homeowners, properties, usages);
    } else if (groupBy?.length === 1 && groupBy[0] === "WALKABLE") {
      return walkableGrouping(homeowners, properties, usages);
    } else {
      return defaultGrouping(homeowners, properties, usages);
    }
  } catch (error) {
    console.log(error);
    throw new ForbiddenError("Invalid username or password.");
  }
}

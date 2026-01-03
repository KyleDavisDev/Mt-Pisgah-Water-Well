import { cookies } from "next/headers";
import { extractKeyFromRequest, getUsernameFromCookie, validatePermission } from "../utils/utils";
import Homeowners from "../models/Homeowners";
import Property from "../models/Properties";
import { HomeownerRepository } from "../repositories/homeownerRepository";
import { PropertyRepository } from "../repositories/propertyRepository";
import { withErrorHandler } from "../utils/handlers";
import { BillRepository } from "../repositories/billRepository";
import Bill from "../models/Bills";
import Homeowner from "../models/Homeowners";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

// TODO: Finish this out if/when needed
const defaultGrouping = (homeowners: Homeowner[], properties: Property[], bills: Bill[]) => {
  return Response.json({
    bills: bills.map(bill => {
      return {
        ...bill,
        property: properties
          .filter(p => p.id === bill.property_id)
          .map(property => {
            return { ...property };
          })
      };
    })
  });
};

const homeownerGrouping = (homeowners: Homeowner[], properties: Property[], bills: Bill[]) => {
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
                invoices: bills
                  .filter((u: Bill) => u.property_id === p.id)
                  .map((u: Bill) => {
                    return {
                      id: u.id.toString(),
                      month: u.billing_month,
                      year: u.billing_year,
                      gallonsUsed: u.metadata.water_usage ? u.metadata.water_usage.gallons_used.toString() : 0,
                      dateCreated: u.created_at,
                      amountInPennies: u.total_in_pennies,
                      isActive: u.is_active.toString()
                    };
                  })
              };
            })
        };
      })
  });
};

const handler = async (req: Request) => {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  const username = await getUsernameFromCookie(jwtCookie);
  await validatePermission(username, "VIEW_BILLS");

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

  // Fetch the latest water usages for all properties in a single query
  const propertyIds = properties.map(p => p.id);
  const bills = await BillRepository.findAllActiveByPropertyIdInAndTypeAndLimitBy(propertyIds, 6);

  if (groupBy?.length === 1 && groupBy[0].toUpperCase() === "HOMEOWNER") {
    return homeownerGrouping(homeowners, properties, bills);
  } else if (groupBy?.length === 1 && groupBy[0] === "SOME_OTHER_SORTING") {
    return homeownerGrouping(homeowners, properties, bills);
  } else {
    // default
    return defaultGrouping(homeowners, properties, bills);
  }
};

export const GET = withErrorHandler(handler);

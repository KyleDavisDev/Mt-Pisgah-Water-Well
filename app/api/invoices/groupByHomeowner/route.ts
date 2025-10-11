import { cookies } from "next/headers";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import Homeowners from "../../models/Homeowners";
import Property from "../../models/Properties";
import { HomeownerRepository } from "../../repositories/homeownerRepository";
import { PropertyRepository } from "../../repositories/propertyRepository";
import Invoice from "../../models/Invoice";
import { InvoiceRepository } from "../../repositories/invoiceRepository";
import { withErrorHandler } from "../../utils/handlers";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async () => {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  const username = await getUsernameFromCookie(jwtCookie);
  await validatePermission(username, "VIEW_BILLS");

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
  const invoices = await InvoiceRepository.findAllActiveInvoicesByPropertyIdInAndTypeAndLimitBy(
    propertyIds,
    "WATER_USAGE",
    6
  );

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
              invoices: invoices
                .filter((u: Invoice) => u.property_id === p.id)
                .map((u: Invoice) => {
                  return {
                    id: u.id.toString(),
                    month: u.metadata.billing_month,
                    year: u.metadata.billing_year,
                    gallonsUsed: u.metadata.gallons_used.toString(),
                    dateCreated: u.created_at,
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
};

export const GET = withErrorHandler(handler);

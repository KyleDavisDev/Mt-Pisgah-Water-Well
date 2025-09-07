import { cookies } from "next/headers";
import { getUsernameFromCookie, validatePermissions } from "../../../utils/utils";
import Homeowners from "../../../models/Homeowners";
import Property from "../../../models/Properties";
import { HomeownerRepository } from "../../../repositories/homeownerRepository";
import { PropertyRepository } from "../../../repositories/propertyRepository";
import { PaymentRepository } from "../../../repositories/paymentRepository";
import { InvoiceRepository } from "../../../repositories/invoiceRepository";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (req.method !== "GET") {
    // Handle any other HTTP method
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermissions(username, ["READ_PAYMENT", "READ_INVOICE"]);

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

    // Fetch latest payments for all properties in a single query
    const propertyIds = properties.map(p => p.id);
    const [payments, invoices] = await Promise.all([
      PaymentRepository.findActiveTotalByPropertyIds(propertyIds),
      InvoiceRepository.findActiveTotalByPropertyIds(propertyIds)
    ]);

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
              const invoiceTotalRecord = invoices.find(x => x.property_id === p.id);
              const invoiceTotal = invoiceTotalRecord ? invoiceTotalRecord.amount_in_pennies : 0;

              const paymentTotalRecord = payments.find(x => x.property_id === p.id);
              const paymentTotal = paymentTotalRecord ? paymentTotalRecord.amount_in_pennies : 0;

              return {
                id: p.id.toString(),
                address: p.street,
                description: p.description,
                totalInPennies: invoiceTotal - paymentTotal
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

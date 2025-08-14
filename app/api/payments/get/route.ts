import { cookies } from "next/headers";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { getAllActiveHomeowners } from "../../repositories/homeownerRepository";
import { getAllActivePropertiesByHomeownerIdIn } from "../../repositories/propertiesRepository";
import { PaymentRepository } from "../../repositories/paymentRepository";

// NextJS quirk to make the route dynamic
const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (req.method !== "GET") {
    // Handle any other HTTP method
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_PAYMENT");

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

    // Fetch latest payments for all properties in a single query
    const propertyIds = properties.map(p => p.id);
    const payments = await PaymentRepository.findAllActiveByPropertyIdInAndLimitBy(propertyIds, 12);

    const returData = payments.map(payment => {
      return {
        id: payment.id.toString(),
        amountInPennies: payment.amount_in_pennies,
        createdAt: payment.created_at,
        isActive: payment.is_active.toString(),
        method: payment.method,
        property: properties
          .filter(property => property.id === payment.property_id) // get properties related to payment
          .map(property => {
            return {
              id: property.id.toString(),
              address: property.street,
              description: property.description
            };
          })[0],
        propertyOwner: properties
          .filter(property => property.id === payment.property_id) // get properties related to payment
          .map(property => {
            const homeowner = homeowners.find(h => h.id === property.homeowner_id);

            if (!homeowner) return {};

            return {
              id: homeowner.id.toString(),
              name: homeowner.name
            };
          })[0]
      };
    });

    return Response.json({
      payments: returData
    });
  } catch (error) {
    console.log(error);
    return new Response("Invalid username or password.", { status: 403 });
  }

  return new Response("Something went wrong.", { status: 500 });
}

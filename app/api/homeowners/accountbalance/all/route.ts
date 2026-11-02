import Homeowners from "../../../models/Homeowners";
import Property from "../../../models/Properties";
import { HomeownerRepository } from "../../../repositories/homeownerRepository";
import { PropertyRepository } from "../../../repositories/propertyRepository";
import { PaymentRepository } from "../../../repositories/paymentRepository";
import { BillRepository } from "../../../repositories/billRepository";
import { ForbiddenError, MethodNotAllowedError } from "../../../utils/errors";
import { withAuthenticationHandler, withErrorHandler } from "../../../utils/handlers";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request, _ctx: unknown) => {
  if (req.method !== "GET") {
    // Handle any other HTTP method
    throw new MethodNotAllowedError();
  }

  try {
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
    const [payments, bills] = await Promise.all([
      PaymentRepository.findActiveTotalByPropertyIds(propertyIds),
      BillRepository.findActiveTotalByPropertyIds(propertyIds)
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
              const billTotalRecord = bills.find(x => x.property_id === p.id);
              const billTotal = billTotalRecord ? billTotalRecord.total_in_pennies : 0;

              const paymentTotalRecord = payments.find(x => x.property_id === p.id);
              const paymentTotal = paymentTotalRecord ? paymentTotalRecord.amount_in_pennies : 0;

              return {
                id: p.id.toString(),
                address: p.street,
                description: p.description,
                totalInPennies: billTotal - paymentTotal
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

export const GET = withErrorHandler(withAuthenticationHandler(handler, ["READ_PAYMENT", "READ_INVOICE"]));

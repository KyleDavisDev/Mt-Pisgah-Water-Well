import { cookies } from "next/headers";

import {
  getInvoiceById,
  getRecentActiveInvoicesByPropertyBeforeBillingMonthYear
} from "../../repositories/invoiceRepository";
import { getHomeownerByPropertyId } from "../../repositories/homeownerRepository";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { getPropertyById } from "../../repositories/propertiesRepository";
import { PRICING_FORMULAS } from "../pricingFormulas";

export async function GET(req: Request, { params }: { params: { id: string } }): Promise<Response> {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // Validate user permissions
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_BILLS");

    const bill = await getInvoiceById(params.id);
    if (!bill) {
      return Response.json({ error: "Bill not found" }, { status: 404 });
    }

    // Fetch associated homeowner data, property address, historical usages, and late fees in parallel
    const [homeowner, property, historicalUsages, lateFees] = await Promise.all([
      getHomeownerByPropertyId(bill.property_id),
      getPropertyById(bill.property_id),
      getRecentActiveInvoicesByPropertyBeforeBillingMonthYear(
        bill.property_id,
        12,
        bill.billing_month,
        bill.billing_year
      ),
      Promise.resolve(() => 0) // TODO: late fees
    ]);

    if (!homeowner || !property) {
      return Response.json({ error: "Homeowner and Property info not found" }, { status: 404 });
    }

    const formula = PRICING_FORMULAS[bill.formula_used];

    return Response.json({
      bill: {
        id: bill.id,
        amountInPennies: bill.amount_in_pennies,
        formula: {
          description: formula.description,
          baseFeeInPennies: formula.baseFeeInPennies,
          baseGallons: formula.baseGallons,
          usageRateInPennies: formula.usageRateInPennies
        },
        gallonsUsed: bill.gallons_used,
        month: bill.billing_month,
        year: bill.billing_year,
        createdAt: bill.created_at,
        isActive: bill.is_active
      },
      homeowner: { name: homeowner.name },
      property: { street: property.street, city: property.city, state: property.state, zip: property.zip },
      historicalUsage: historicalUsages.map(h => ({
        month: h.billing_month,
        year: h.billing_year,
        gallonsUsed: h.gallons_used,
        amountInPennies: h.amount_in_pennies
      }))
    });
  } catch (error) {
    console.error("Error processing bill request:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

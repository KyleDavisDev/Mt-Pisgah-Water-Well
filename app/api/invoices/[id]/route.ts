import { cookies } from "next/headers";

import { InvoiceRepository } from "../../repositories/invoiceRepository";
import { HomeownerRepository } from "../../repositories/homeownerRepository";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { PropertyRepository } from "../../repositories/propertyRepository";
import { PRICING_FORMULAS } from "../pricingFormulas";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // Validate user permissions
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_BILLS");

    const { id } = await params;
    const bill = await InvoiceRepository.getInvoiceById(id);
    if (!bill) {
      return Response.json({ error: "Bill not found" }, { status: 404 });
    }

    // Fetch associated homeowner data, property address, historical usages, and late fees in parallel
    const [homeowner, property, historicalInvoices, lateFees] = await Promise.all([
      HomeownerRepository.getHomeownerByPropertyId(bill.property_id),
      PropertyRepository.getPropertyById(bill.property_id),
      InvoiceRepository.getRecentActiveWaterInvoicesByPropertyBeforeBillingMonthYear(
        bill.property_id,
        11,
        bill.metadata.billing_month,
        bill.metadata.billing_year
      ),
      Promise.resolve(() => 0) // TODO: late fees
    ]);

    if (!homeowner || !property) {
      return Response.json({ error: "Homeowner and Property info not found" }, { status: 404 });
    }

    return Response.json({
      homeowner: { name: homeowner.name },
      property: { street: property.street, city: property.city, state: property.state, zip: property.zip },
      invoices: [bill, ...historicalInvoices].map(invoice => ({
        id: invoice.id,
        amountInPennies: invoice.amount_in_pennies,
        month: invoice.metadata.billing_month,
        year: invoice.metadata.billing_year,
        gallonsStart: invoice.metadata.gallons_start,
        gallonsEnd: invoice.metadata.gallons_end,
        gallonsUsed: invoice.metadata.gallons_used,
        createdAt: invoice.created_at,
        formula: {
          description: PRICING_FORMULAS[invoice.metadata.formula_used].description,
          baseFeeInPennies: PRICING_FORMULAS[invoice.metadata.formula_used].baseFeeInPennies,
          baseGallons: PRICING_FORMULAS[invoice.metadata.formula_used].baseGallons,
          usageRateInPennies: PRICING_FORMULAS[invoice.metadata.formula_used].usageRateInPennies
        }
      }))
    });
  } catch (error) {
    console.error("Error processing bill request:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

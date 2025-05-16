import {
  getStartAndEndOfProvidedMonthAndNextMonth,
  getUsernameFromCookie,
  validatePermission
} from "../../utils/utils";
import { cookies } from "next/headers";
import { getFirstUsageByDateCollectedRangeAndPropertyIn } from "../../repositories/usageRepository";
import { getAllActiveProperties } from "../../repositories/propertiesRepository";
import { PRICING_FORMULAS } from "../pricingFormulas";
import {
  getActiveInvoiceByYearAndMonthAndPropertyIn,
  insertNewInvoiceAsTransactional
} from "../../repositories/invoiceRepository";
import { InvoiceCreate } from "../../models/Invoice";

export async function POST(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "CREATE_INVOICE");

    // TODO: Data validation
    const { month, year } = await req.json();

    if (!month || !year) {
      return new Response("Missing month or year", { status: 400 });
    }

    const { startOfMonth, endOfMonth, startOfNextMonth, endOfNextMonth } = getStartAndEndOfProvidedMonthAndNextMonth(
      year,
      month
    );

    const properties = await getAllActiveProperties();

    const propertyIds = properties.map((p: any) => p.id);
    const startingUsages = await getFirstUsageByDateCollectedRangeAndPropertyIn(startOfMonth, endOfMonth, propertyIds);
    const endingUsages = await getFirstUsageByDateCollectedRangeAndPropertyIn(
      startOfNextMonth,
      endOfNextMonth,
      propertyIds
    );

    let createdBillsCount = 0;

    for (const property of properties) {
      const startingUsage = startingUsages.find((u: any) => u.property_id === property.id);
      const endingUsage = endingUsages.find((u: any) => u.property_id === property.id);

      if (!startingUsage || !endingUsage) continue;

      const gallonsUsed = endingUsage.gallons - startingUsage.gallons;

      // Check if bill already exists
      const existing = await getActiveInvoiceByYearAndMonthAndPropertyIn(parseInt(year), parseInt(month), [
        property.id
      ]);

      if (existing.length > 0) continue;

      const formula = PRICING_FORMULAS["tiered_2025_v1"];
      const newData: InvoiceCreate = {
        property_id: property.id,
        metadata: {
          billing_month: parseInt(month),
          billing_year: parseInt(year),
          gallons_used: gallonsUsed,
          formula_used: `${formula.name}`
        },
        type: "WATER_USAGE",
        amount_in_pennies: formula.calculate(gallonsUsed),
        is_active: true
      };

      await insertNewInvoiceAsTransactional(username, newData);
      createdBillsCount++;
    }

    console.log(`${createdBillsCount} bill(s) created.`);
    return Response.json({ message: `${createdBillsCount} bill(s) created.` });
  } catch (error) {
    console.error("Error creating usage bills:", error);
    return new Response("Error creating usage bills", { status: 500 });
  }
}

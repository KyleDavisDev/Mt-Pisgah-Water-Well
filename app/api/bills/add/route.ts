import { db } from "../../utils/db";
import {
  getStartAndEndOfProvidedMonthAndNextMonth,
  getUsernameFromCookie,
  validatePermission
} from "../../utils/utils";
import { cookies } from "next/headers";
import { addAuditTableRecord } from "../../utils/utils";
import { getFirstUsageByDateCollectedRangeAndPropertyIn } from "../../repositories/usageRepository";
import { getAllActiveProperties } from "../../repositories/propertiesRepository";

type Formula = {
  name: string;
  calculate: (gallons: number) => number;
  description: string;
};

const PRICING_FORMULAS: Record<string, Formula> = {
  tiered_2025_v1: {
    name: "tiered_2025_v1",
    description: "Flat $21 for first 2000 gallons used, then additional $0.0001 per gallon after.",
    calculate: (gallons: number) => (gallons <= 2000 ? 2100 : 2100 + Math.round(gallons * 0.01))
  },
  flat_rate: {
    name: "flat_rate",
    description: "Simple flat fee of $25",
    calculate: (_gallons: number) => 2500
  }
};

const calculateAmountInPenniesFromGallons = (formula: Formula, gallons: number) => {
  return formula.calculate(gallons);
};

export async function POST(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "CREATE_BILLS");

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
      const existing = await db`
          SELECT *
          FROM usage_bill
          WHERE property_id = ${property.id}
            AND billing_month = ${parseInt(month)}
            AND billing_year = ${parseInt(year)}
            AND is_active = true
      `;

      if (existing.length > 0) continue;

      const formulaToUse = PRICING_FORMULAS["tiered_2025_v1"];
      const newData = {
        property_id: property.id,
        billing_month: parseInt(month),
        billing_year: parseInt(year),
        gallons_used: gallonsUsed,
        amount_in_pennies: calculateAmountInPenniesFromGallons(formulaToUse, gallonsUsed),
        formula_used: `${formulaToUse.name}||${formulaToUse.description}`,
        is_active: true
      };

      const auditLog = await addAuditTableRecord({
        tableName: "usage_bill",
        recordId: 0,
        newData: JSON.stringify(newData),
        actionBy: username,
        actionType: "INSERT"
      });

      if (!auditLog) continue;

      await db.begin(async db => {
        const inserted = await db`
            INSERT INTO usage_bill (property_id, billing_month, billing_year, gallons_used, amount_in_pennies,
                                    formula_used, is_active)
            VALUES (${newData.property_id}, ${newData.billing_month}, ${newData.billing_year},
                    ${newData.gallons_used}, ${newData.amount_in_pennies},
                    ${newData.formula_used}, ${newData.is_active})
            RETURNING *;
        `;

        await db`
            UPDATE audit_log
            SET is_complete = true,
                record_id   = ${inserted[0].id}
            WHERE id = ${auditLog.id};
        `;

        createdBillsCount++;
      });
    }

    console.log(`${createdBillsCount} bill(s) created.`);
    return Response.json({ message: `${createdBillsCount} bill(s) created.` });
  } catch (error) {
    console.error("Error creating usage bills:", error);
    return new Response("Error creating usage bills", { status: 500 });
  }
}

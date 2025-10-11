import { cookies } from "next/headers";
import {
  extractKeyFromRequest,
  getStartAndEndOfProvidedMonthAndNextMonth,
  getUsernameFromCookie,
  validatePermission
} from "../../utils/utils";
import { UsageRepository } from "../../repositories/usageRepository";
import { PropertyRepository } from "../../repositories/propertyRepository";
import { HomeownerRepository } from "../../repositories/homeownerRepository";
import { InvoiceRepository } from "../../repositories/invoiceRepository";
import { withErrorHandler } from "../../utils/handlers";
import { BadRequestError } from "../../utils/errors";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request) => {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  const username = await getUsernameFromCookie(jwtCookie);
  await validatePermission(username, "VIEW_USAGES");

  const month = extractKeyFromRequest(req, "month");
  const year = extractKeyFromRequest(req, "year");

  if (!month || !year) {
    throw new BadRequestError("Missing 'month' or 'year' query parameter");
  }

  if (month.length > 1 || year.length > 1) {
    throw new BadRequestError("'month' and 'year' cannot be arrays");
  }

  const { startOfMonth, endOfMonth, startOfNextMonth, endOfNextMonth } = getStartAndEndOfProvidedMonthAndNextMonth(
    year[0],
    month[0]
  );

  const properties = await PropertyRepository.getAllActiveProperties();
  const propertyIds = properties.map((p: any) => p.id);

  const startingUsages = await UsageRepository.getFirstUsageByDateCollectedRangeAndPropertyIn(
    startOfMonth,
    endOfMonth,
    propertyIds
  );
  const endingUsages = await UsageRepository.getFirstUsageByDateCollectedRangeAndPropertyIn(
    startOfNextMonth,
    endOfNextMonth,
    propertyIds
  );
  const alreadyCreatedBills = await InvoiceRepository.getActiveInvoiceByYearAndMonthAndPropertyIn(
    parseInt(year[0], 10),
    parseInt(month[0], 10),
    propertyIds
  );

  const homeowners = await HomeownerRepository.getAllActiveHomeowners();
  const returnData = homeowners
    .filter(h => {
      return properties.some(p => p.homeowner_id === h.id);
    })
    .map(homeowner => {
      return {
        id: homeowner.id.toString(),
        name: homeowner.name,
        properties: properties
          .filter(p => p.homeowner_id === homeowner.id)
          .map(p => {
            const firstUsage = startingUsages.find(f => f.property_id === p.id);
            const lastUsage = endingUsages.find(l => l.property_id === p.id);
            const isAlreadyCreated = alreadyCreatedBills.find(b => b.property_id === p.id);

            return {
              id: p.id.toString(),
              address: p.street,
              description: p.description,
              startingGallons: firstUsage ? firstUsage.gallons : "--",
              endingGallons: lastUsage ? lastUsage.gallons : "--",
              gallonsUsed: lastUsage && firstUsage ? lastUsage.gallons - firstUsage.gallons : "--",
              isAlreadyCreated: !!isAlreadyCreated
            };
          })
      };
    });

  return Response.json({
    homeowners: returnData
  });
};

export const GET = withErrorHandler(handler);

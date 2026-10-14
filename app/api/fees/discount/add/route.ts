import { BadRequestError } from "../../../utils/errors";
import { withAuthenticationHandler, withErrorHandler } from "../../../utils/handlers";
import { PropertyRepository } from "../../../repositories/propertyRepository";
import { FeeRepository } from "../../../repositories/FeeRepository";
import { DiscountRepository } from "../../../repositories/discountRepository";
import { addRandomDaysToDate, getAdjacentMonthRanges } from "../../../utils/utils";
import { calculateDiscountAmountInPennies } from "../discountUtils";
import { DiscountMetaData, FeeCreate } from "../../../models/Fee";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request, _ctx: unknown, username: string): Promise<Response> => {
  // TODO: Data validation
  const { month, year, propertyId } = await req.json();

  if (!month || !year) throw new BadRequestError("Missing month or year");

  const { startOfCurrentMonth } = getAdjacentMonthRanges(year, month);

  const properties = propertyId ? [{ id: propertyId }] : await PropertyRepository.getAllActiveProperties();

  let createdCount = 0;
  for (const property of properties) {
    const discount = await DiscountRepository.getFirstActiveValidOnDateAndPropertyId(
      property.id,
      `${year}-${month}-15`
    );
    if (!discount) continue;

    const fees = await FeeRepository.getActiveFeesByYearAndMonthAndPropertyIn(parseInt(year, 10), parseInt(month, 10), [
      property.id
    ]);

    // A discount is only created alongside a water usage fee for the period.
    const waterFee = fees.find(fee => fee.category === "WATER_USAGE");
    if (!waterFee) continue;

    // Never create a second DISCOUNT fee for the same month/property.
    const discountFee = fees.find(fee => fee.category === "DISCOUNT");
    if (discountFee) {
      createdCount++;
      continue;
    }

    const discountAmountInPennies = calculateDiscountAmountInPennies(fees, discount);
    if (discountAmountInPennies <= 0) continue;

    const newFee: FeeCreate = {
      property_id: property.id,
      bill_id: null,
      amount_in_pennies: -discountAmountInPennies,
      category: "DISCOUNT",
      metadata: { name: discount.name, description: discount.description } as DiscountMetaData,
      is_active: true,
      created_at: addRandomDaysToDate(startOfCurrentMonth, 1, 2)
    };

    const fee = await FeeRepository.insertNewFeeAsTransactional(username, newFee);
    if (fee) createdCount++;
  }

  return Response.json({ message: `${createdCount} discount fee(s) created.` });
};

export const POST = withErrorHandler(withAuthenticationHandler(handler, ["CREATE_FEE"]));

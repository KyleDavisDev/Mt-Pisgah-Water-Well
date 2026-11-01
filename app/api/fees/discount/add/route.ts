import { BadRequestError } from "../../../utils/errors";
import { withAuthenticationHandler, withErrorHandler } from "../../../utils/handlers";
import { PropertyRepository } from "../../../repositories/propertyRepository";
import { getAdjacentMonthRanges } from "../../../utils/utils";

import { buildDiscountFees } from "./buildDiscountFees";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request, _ctx: unknown, username: string): Promise<Response> => {
  // TODO: Data validation
  const { month, year, propertyId } = await req.json();

  if (!month || !year) throw new BadRequestError("Missing month or year");

  const { startOfCurrentMonth } = getAdjacentMonthRanges(year, month);
  const properties = propertyId ? [{ id: propertyId }] : await PropertyRepository.getAllActiveProperties();

  const fees = buildDiscountFees(
    `${year}-${month}-02`,
    properties.map(x => x.id),
    username
  );

  let createdCount = 0;

  return Response.json({ message: `${createdCount} discount fee(s) created.` });
};

export const POST = withErrorHandler(withAuthenticationHandler(handler, ["CREATE_FEE"]));

import { BadRequestError } from "../../../utils/errors";
import { withAuthenticationHandler, withErrorHandler } from "../../../utils/handlers";
import { PropertyRepository } from "../../../repositories/propertyRepository";
import { getAdjacentMonthRanges } from "../../../utils/utils";

import { buildDiscountFees } from "./buildDiscountFees";
import { DiscountRepository } from "../../../repositories/discountRepository";
import { FeeRepository } from "../../../repositories/FeeRepository";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request, _ctx: unknown, username: string): Promise<Response> => {
  // TODO: Data validation
  const { month, year, propertyId } = await req.json();

  if (!month || !year) throw new BadRequestError("Missing month or year");

  const properties = propertyId ? [{ id: propertyId }] : await PropertyRepository.getAllActiveProperties();

  const discounts = await buildDiscountFees(
    `${year}-${month}-02`,
    properties.map(x => x.id),
    username
  );

  const savedDiscounts = await FeeRepository.insertNewFeesAsTransaction(username, discounts);

  return Response.json({ message: `${savedDiscounts.length} discount fee(s) created.` });
};

export const POST = withErrorHandler(withAuthenticationHandler(handler, ["CREATE_FEE"]));

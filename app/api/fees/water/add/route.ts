import { BadRequestError } from "../../../utils/errors";
import { withAuthenticationHandler, withErrorHandler } from "../../../utils/handlers";
import { PropertyRepository } from "../../../repositories/propertyRepository";
import { createAndInsertWaterUsageFees } from "./createAndInsertWaterUsageFees";

const handler = async (req: Request, _ctx: unknown, username: string): Promise<Response> => {
  // TODO: Data validation
  const { month, year, propertyId } = await req.json();

  if (!month || !year) {
    throw new BadRequestError("Missing month or year");
  }

  const properties = propertyId ? [{ id: propertyId }] : await PropertyRepository.getAllActiveProperties();

  const fees = await createAndInsertWaterUsageFees(
    `${year}-${month}-02`,
    properties.map(x => x.id),
    username
  );

  return Response.json({ message: `${fees} fees(s) created.` });
};

export const POST = withErrorHandler(withAuthenticationHandler(handler, ["CREATE_FEE"]));

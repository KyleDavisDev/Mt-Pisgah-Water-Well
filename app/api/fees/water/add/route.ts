import { cookies } from "next/headers";

import { getUsernameFromCookie } from "../../../utils/utils";
import { BadRequestError } from "../../../utils/errors";
import { withErrorHandler } from "../../../utils/handlers";
import { FeeRepository } from "../../../repositories/FeeRepository";
import { PropertyRepository } from "../../../repositories/propertyRepository";
import { createAndInsertWaterUsageFees } from "./createAndInsertWaterUsageFees";

const handler = async (req: Request): Promise<Response> => {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  const username = await getUsernameFromCookie(jwtCookie);

  // TODO: Data validation
  const { month, year, propertyId } = await req.json();

  if (!month || !year) {
    throw new BadRequestError("Missing month or year");
  }

  const properties = propertyId ? [{ id: propertyId }] : await PropertyRepository.getAllActiveProperties();

  const fees = createAndInsertWaterUsageFees(
    `${year}-${month}-02`,
    properties.map(x => x.id),
    username
  );

  return Response.json({ message: `${fees} fees(s) created.` });
};

export const POST = withErrorHandler(handler);

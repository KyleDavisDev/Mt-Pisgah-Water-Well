import { cookies } from "next/headers";

import { fetchBillDetails, getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { ResourceNotFoundError } from "../../utils/errors";
import { withErrorHandler } from "../../utils/handlers";
import { billDetailsMapper } from "../mapper/billMapper";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> => {
  // Validate user permissions
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  const username = await getUsernameFromCookie(jwtCookie);
  await validatePermission(username, "VIEW_BILLS");

  const { id } = await params;

  if (!id) {
    throw new ResourceNotFoundError();
  }

  const { bill, homeowner, property, historicalWaterFees } = await fetchBillDetails(id);

  if (!homeowner || !property) {
    throw new ResourceNotFoundError("Homeowner and Property info not found");
  }

  return Response.json(
    billDetailsMapper({
      currentBill: bill,
      homeowner,
      property,
      historicalWaterFees
    })
  );
};

export const GET = withErrorHandler(handler);

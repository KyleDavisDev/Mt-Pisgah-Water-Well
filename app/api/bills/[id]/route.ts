import { fetchBillDetails } from "../../utils/utils";
import { ResourceNotFoundError } from "../../utils/errors";
import { withAuthenticationHandler, withErrorHandler } from "../../utils/handlers";
import { billDetailsMapper } from "../mapper/billMapper";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> => {
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

export const GET = withErrorHandler(withAuthenticationHandler(handler, ["VIEW_BILLS"]));

import { fetchInvoiceDetails } from "../../utils/utils";
import { ResourceNotFoundError } from "../../utils/errors";
import { withAuthenticationHandler, withErrorHandler } from "../../utils/handlers";
import { invoiceDetailsMapper } from "./mapper/mapInvoiceDetails";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> => {
  const { id } = await params;

  if (!id) {
    throw new ResourceNotFoundError();
  }

  const { bill, homeowner, property, historicalInvoices } = await fetchInvoiceDetails(id);

  if (!homeowner || !property) {
    throw new ResourceNotFoundError("Homeowner and Property info not found");
  }

  return Response.json(invoiceDetailsMapper(bill, homeowner, property, historicalInvoices));
};

export const GET = withErrorHandler(withAuthenticationHandler(handler, ["VIEW_BILLS"]));

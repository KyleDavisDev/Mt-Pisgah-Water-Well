import { cookies } from "next/headers";

import { fetchInvoiceDetails, getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { ResourceNotFoundError } from "../../utils/errors";
import { withErrorHandler } from "../../utils/handlers";
import { invoiceDetailsMapper } from "./mapper/mapInvoiceDetails";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> => {
  // Validate user permissions
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  const username = await getUsernameFromCookie(jwtCookie);
  await validatePermission(username, "VIEW_BILLS");

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

export const GET = withErrorHandler(handler);

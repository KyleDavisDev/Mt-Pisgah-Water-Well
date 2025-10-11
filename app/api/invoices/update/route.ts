import { cookies } from "next/headers";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { InvoiceRepository } from "../../repositories/invoiceRepository";
import { withErrorHandler } from "../../utils/handlers";
import { BadRequestError, InternalServerError, ResourceNotFoundError } from "../../utils/errors";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request) => {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  const username = await getUsernameFromCookie(jwtCookie);
  await validatePermission(username, "UPDATE_INVOICE");

  const { id, isActive } = await req.json();

  if (!id || !isActive) {
    throw new BadRequestError("Missing required fields");
  }

  // Find the invoice to be edited
  const oldInvoice = await InvoiceRepository.getInvoiceById(id);
  if (!oldInvoice) throw new ResourceNotFoundError("Cannot find invoice record");

  // Set the new record data
  const newUsage = { ...oldInvoice, is_active: isActive === "true" };

  const updatedRecord = await InvoiceRepository.updateInvoiceAsTransactional(username, oldInvoice, newUsage);

  if (!updatedRecord) throw new InternalServerError("Failed to update invoice record");

  return Response.json({ message: "Success!" });
};

export const PUT = withErrorHandler(handler);

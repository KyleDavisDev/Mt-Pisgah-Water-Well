import { cookies } from "next/headers";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { InvoiceRepository } from "../../repositories/invoiceRepository";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  if (req.method !== "PUT") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "UPDATE_INVOICE");

    const { id, isActive } = await req.json();

    if (!id || !isActive) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Find the invoice to be edited
    const oldInvoice = await InvoiceRepository.getInvoiceById(id);
    if (!oldInvoice) return new Response("Cannot find invoice record", { status: 404 });

    // Set the new record data
    const newUsage = { ...oldInvoice, is_active: isActive === "true" };

    const updatedRecord = await InvoiceRepository.updateInvoiceAsTransactional(username, oldInvoice, newUsage);

    if (!updatedRecord) return new Response("Failed to update invoice record", { status: 500 });

    return Response.json({ message: "Success!" });
  } catch (error) {
    console.log(error);
    return new Response("Invalid username or password.", { status: 403 });
  }

  return new Response("Something went wrong.", { status: 500 });
}

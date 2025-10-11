import { cookies } from "next/headers";

import { getUsernameFromCookie, validatePermission } from "../../../utils/utils";
import { BadRequestError, InternalServerError } from "../../../utils/errors";
import { InvoiceRepository } from "../../../repositories/invoiceRepository";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    // Validate user permissions
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_BILLS");

    const { id } = await params;

    // Quick sanitize and validate the property id
    if (!id || isNaN(Number(id))) {
      throw new BadRequestError("Invalid property id");
    }
    const propertyId = Number(id);

    const invoices = await InvoiceRepository.getInvoicesByPropertyIdsAndType([propertyId], "WATER_USAGE");

    return Response.json({
      invoices: invoices.map(invoice => {
        return {
          id: invoice.id,
          propertyId: invoice.property_id,
          amountInPennies: invoice.amount_in_pennies,
          type: invoice.type,
          metadata: invoice.metadata,
          createdAt: invoice.created_at,
          isActive: invoice.is_active
        };
      })
    });
  } catch (error) {
    throw new InternalServerError("Internal server error");
  }
}

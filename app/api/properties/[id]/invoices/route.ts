import { BadRequestError, InternalServerError } from "../../../utils/errors";
import { InvoiceRepository } from "../../../repositories/invoiceRepository";
import { withAuthenticationHandler, withErrorHandler } from "../../../utils/handlers";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> => {
  try {
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
};

export const GET = withErrorHandler(withAuthenticationHandler(handler, ["VIEW_BILLS"]));

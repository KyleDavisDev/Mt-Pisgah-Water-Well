import { cookies } from "next/headers";

import { getUsernameFromCookie, validatePermission } from "../../../utils/utils";
import { PaymentRepository } from "../../../repositories/paymentRepository";
import { BadRequestError } from "../../../utils/errors";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    // Validate user permissions
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_PAYMENT");

    const { id } = await params;

    // Quick sanitize and validate the property id
    if (!id || isNaN(Number(id))) {
      throw new BadRequestError("Invalid property id");
    }
    const propertyId = Number(id);

    const payments = await PaymentRepository.findAllActiveByPropertyId(propertyId);

    return Response.json({
      payments: payments.map(payment => {
        return {
          id: payment.id,
          amountInPennies: payment.amount_in_pennies,
          method: payment.method,
          propertyId: payment.property_id,
          createdAt: payment.created_at,
          isActive: payment.is_active
        };
      })
    });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

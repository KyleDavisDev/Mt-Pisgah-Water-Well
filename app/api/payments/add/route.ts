import { cookies } from "next/headers";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { PaymentCreate } from "../../models/Payments";
import { PaymentRepository } from "../../repositories/paymentRepository";
import { withErrorHandler } from "../../utils/handlers";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const toModelAdapter = (payments: any): PaymentCreate[] => {
  if (!payments) throw Error("Could not map payments object");
  if (!Array.isArray(payments)) throw Error("Payments must be an array");

  return payments
    .map((payment: any) => {
      return {
        property_id: parseInt(payment.propertyId, 10),
        amount_in_pennies: payment.amountInPennies,
        method: payment.method,
        created_at: payment.createdAt,
        is_active: true
      };
    })
    .filter(x => x.amount_in_pennies > 0)
    .filter(x => x.property_id !== 0)
    .filter(x => x.method === "CHECK" || x.method === "CASH");
};

const handler = async (req: Request) => {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  const username = await getUsernameFromCookie(jwtCookie);
  await validatePermission(username, "CREATE_PAYMENT");

  // TODO: Data validation
  const { payments } = await req.json();
  const paymentsToSave = toModelAdapter(payments);

  await PaymentRepository.insertMany(username, paymentsToSave);

  return Response.json({ message: `Success! Saved ${paymentsToSave.length}` });
};

export const POST = withErrorHandler(handler);

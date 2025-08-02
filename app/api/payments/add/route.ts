import { cookies } from "next/headers";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { PaymentCreate } from "../../models/Payments";
import { PaymentRepository } from "../../repositories/paymentRepository";

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
    .filter(x => x.amount_in_pennies !== 0)
    .filter(x => x.property_id !== 0)
    .filter(x => x.method === "CHECK" || x.method === "CASH");
};

export async function POST(req: Request) {
  if (req.method !== "POST") {
    // Handle any other HTTP method
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "CREATE_PAYMENT");

    // TODO: Data validation
    const { payments } = await req.json();
    const paymentsToSave = toModelAdapter(payments);

    const savedPayments = await PaymentRepository.insertMany(username, paymentsToSave);

    return Response.json({ message: "Success!" });
  } catch (error) {
    return new Response("Invalid username or password.", { status: 403 });
  }

  return new Response("Something went wrong.", { status: 500 });
}

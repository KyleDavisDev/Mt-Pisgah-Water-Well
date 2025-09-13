import { cookies } from "next/headers";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { PaymentRepository } from "../../repositories/paymentRepository";
import { MethodNotAllowedError } from "../../utils/errors";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  if (req.method !== "PUT") {
    throw new MethodNotAllowedError();
  }
  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "UPDATE_PAYMENT");

    const { id, isActive } = await req.json();

    if (!id || !isActive) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Find the payment to be edited
    const oldPayment = await PaymentRepository.findById(id);
    if (!oldPayment) return new Response("Cannot find payment record", { status: 404 });

    // Set the new record data
    const newPayment = { ...oldPayment, is_active: isActive === "true" };

    const updatedRecord = await PaymentRepository.updateAsTransactional(username, oldPayment, newPayment);

    if (!updatedRecord) return new Response("Failed to update payment record", { status: 500 });

    return Response.json({ message: "Success!" });
  } catch (error) {
    console.log(error);
    return new Response("Invalid username or password.", { status: 403 });
  }

  return new Response("Something went wrong.", { status: 500 });
}

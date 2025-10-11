import { cookies } from "next/headers";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { PaymentRepository } from "../../repositories/paymentRepository";
import { withErrorHandler } from "../../utils/handlers";
import { BadRequestError, InternalServerError, ResourceNotFoundError } from "../../utils/errors";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request) => {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  const username = await getUsernameFromCookie(jwtCookie);
  await validatePermission(username, "UPDATE_PAYMENT");

  const { id, isActive } = await req.json();

  if (!id || !isActive) {
    throw new BadRequestError("Missing required fields");
  }

  // Find the payment to be edited
  const oldPayment = await PaymentRepository.findById(id);
  if (!oldPayment) throw new ResourceNotFoundError("Cannot find payment record");

  // Set the new record data
  const newPayment = { ...oldPayment, is_active: isActive === "true" };

  const updatedRecord = await PaymentRepository.updateAsTransactional(username, oldPayment, newPayment);

  if (!updatedRecord) throw new InternalServerError("Failed to update payment record");

  return Response.json({ message: "Success!" });
};

export const PUT = withErrorHandler(handler);

import { cookies } from "next/headers";
import { db } from "../../utils/db";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { AuditRepository } from "../../repositories/auditRepository";
import { withErrorHandler } from "../../utils/handlers";
import { BadRequestError, InternalServerError, UnauthorizedError } from "../../utils/errors";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request) => {
  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    if (!jwtCookie) {
      throw new UnauthorizedError();
    }
    const username = await getUsernameFromCookie(jwtCookie);
    if (!username) {
      throw new UnauthorizedError();
    }
    await validatePermission(username, "ADD_HOMEOWNER");

    const { name, email, phone, mailingAddress } = await req.json();

    if (
      !name ||
      !mailingAddress ||
      (email !== null && typeof email !== "string") ||
      (phone !== null && typeof phone !== "string")
    ) {
      throw new BadRequestError("Missing required fields");
    }

    const auditLog = await AuditRepository.addAuditTableRecord({
      tableName: "homeowners",
      recordId: 0, // will update
      newData: JSON.stringify({ name, email, phone, mailingAddress, is_active: true }),
      actionBy: username,
      actionType: "INSERT"
    });

    if (!auditLog) {
      throw new InternalServerError("Unable to insert audit_log record");
    }

    try {
      await db.begin(async db => {
        const homeowner = await db`
            INSERT into homeowners (name, email, phone_number, mailing_address, is_active)
            values (${name}, ${email}, ${phone}, ${mailingAddress}, true)
            returning *;
        `;

        await db`
            UPDATE audit_log
            SET is_complete= true,
                record_id  = ${homeowner[0].id}
            WHERE id = ${auditLog.id};
        `;
      });
    } catch (e) {
      console.error("Failed to insert Homeowner record", e);
    }

    return Response.json({ message: "Success!" });
  } catch (error) {
    console.log(error);
    throw new InternalServerError("Something went wrong.");
  }
};

export const POST = withErrorHandler(handler);

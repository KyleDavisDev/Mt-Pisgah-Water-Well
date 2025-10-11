import { cookies } from "next/headers";
import { db } from "../../utils/db";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { AuditRepository } from "../../repositories/auditRepository";
import { BadRequestError, ForbiddenError, ResourceNotFound } from "../../utils/errors";
import { withErrorHandler } from "../../utils/handlers";
import { HomeownerRepository } from "../../repositories/homeownerRepository";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (req: Request) => {
  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "UPDATE_HOMEOWNER");

    const { name, email, phone, mailingAddress, id, isActive } = await req.json();

    if (!name || !mailingAddress || !id || isActive === undefined) {
      throw new BadRequestError("Missing required fields");
    }

    if (
      typeof name !== "string" ||
      typeof mailingAddress !== "string" ||
      typeof id !== "string" ||
      typeof isActive !== "string" ||
      (email !== null && typeof email !== "string") ||
      (phone !== null && typeof phone !== "string")
    ) {
      throw new BadRequestError("Invalid field format");
    }

    // Find record to be edited
    const oldRecord = await HomeownerRepository.getHomeownerByPropertyId(parseInt(id, 10));

    if (!oldRecord) {
      throw new ResourceNotFound("Cannot find homeowners record");
    }

    // Get new record data
    const newObj = { ...oldRecord, name, email, phone, mailingAddress, id, is_active: isActive === "true" };

    // log intent
    const auditRecord = await AuditRepository.addAuditTableRecord({
      oldData: JSON.stringify(oldRecord),
      newData: JSON.stringify(newObj),
      recordId: oldRecord.id,
      tableName: "homeowners",
      actionType: "UPDATE",
      actionBy: username
    });

    // Make update in a transaction
    await db.begin(async db => {
      await db`
          UPDATE homeowners
          SET name            = ${newObj.name},
              email           = ${newObj.email},
              phone_number    = ${newObj.phone},
              mailing_address = ${newObj.mailingAddress},
              is_active       = ${newObj.is_active}
          WHERE id = ${id};
      `;

      await db`
          UPDATE audit_log
          SET is_complete= true
          WHERE id = ${auditRecord.id};
      `;
    });

    return Response.json({ message: "Success!" });
  } catch (error) {
    throw new ForbiddenError("Invalid username or password.");
  }
};

export const PUT = withErrorHandler(handler);

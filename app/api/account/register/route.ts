import { db } from "../../utils/db";
import bcrypt from "bcrypt";
import { UserRepository } from "../../repositories/userRepository";
import { AuditRepository } from "../../repositories/auditRepository";
import { withErrorHandler } from "../../utils/handlers";
import { BadRequestError, InternalServerError } from "../../utils/errors";

const pwConcat = process.env.PASSWORD_CONCAT;
const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);

const handler = async (req: Request): Promise<Response> => {
  try {
    const { name, username, password } = await req.json();

    // Basic validation
    if (!name || !username || !password) {
      throw new BadRequestError("Missing required fields.");
    }

    if (!pwConcat || !saltRounds) {
      throw new InternalServerError("Server misconfiguration.");
    }

    try {
      await UserRepository.getUserByUsername(username);

      console.log("Sending fake account creation message.");
      return Response.json({ message: "User created successfully" }, { status: 201 });
    } catch (e) {}

    // Hash password with salt and secret
    const saltedPassword = password + pwConcat;
    const hashedPassword = await bcrypt.hash(saltedPassword, saltRounds);

    const auditLog = await AuditRepository.addAuditTableRecord({
      tableName: "users",
      recordId: 0, // will update
      newData: JSON.stringify({ name, username, hashedPassword, is_active: true }),
      actionBy: "SYSTEM",
      actionType: "INSERT"
    });

    if (!auditLog) {
      throw new InternalServerError("Unable to insert audit_log record");
    }

    try {
      await db.begin(async db => {
        const result = await db`
            INSERT INTO users (name, username, password, is_active)
            VALUES (${name}, ${username}, ${hashedPassword}, true)
            RETURNING id, username
        `;

        await db`
            UPDATE audit_log
            SET is_complete= true,
                record_id  = ${result[0].id}
            WHERE id = ${auditLog.id};
        `;
      });
    } catch (e) {
      console.error("Failed to insert User record", e);
    }

    return Response.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("User creation failed:", error);
    throw new InternalServerError("Internal Server Error");
  }
};

export const POST = withErrorHandler(handler);

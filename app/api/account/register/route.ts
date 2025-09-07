import { db } from "../../utils/db";
import bcrypt from "bcrypt";
import { UserRepository } from "../../repositories/userRepository";
import { AuditRepository } from "../../repositories/auditRepository";

const pwConcat = process.env.PASSWORD_CONCAT;
const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);

export async function POST(req: Request): Promise<Response> {
  try {
    const { name, username, password } = await req.json();

    // Basic validation
    if (!name || !username || !password) {
      return new Response("Missing required fields.", { status: 400 });
    }

    if (!pwConcat || !saltRounds) {
      return new Response("Server misconfiguration.", { status: 500 });
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
      return new Response("Unable to insert audit_log record", { status: 500 });
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
  } catch (err) {
    console.error("User creation failed:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

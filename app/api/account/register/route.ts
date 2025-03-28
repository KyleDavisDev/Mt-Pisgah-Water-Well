import { db } from "../../utils/db";
import bcrypt from "bcrypt";
import { getUserByUsername } from "../../utils/utils";

const pwConcat = process.env.PASSWORD_CONCAT;
const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);

interface RequestBody {
  name: string;
  username: string;
  password: string;
}

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
      await getUserByUsername(username);
    } catch (e) {
      // Fake response.
      return Response.json({ message: "User created successfully" }, { status: 201 });
    }

    // Hash password with salt and secret
    const saltedPassword = password + pwConcat;
    const hashedPassword = await bcrypt.hash(saltedPassword, saltRounds);

    // Insert user
    const result = await db`
        INSERT INTO users (name, username, password, is_active)
        VALUES (${name}, ${username}, ${hashedPassword}, true)
        RETURNING id, username
    `;

    return Response.json({ message: "User created successfully" }, { status: 201 });
  } catch (err) {
    console.error("User creation failed:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

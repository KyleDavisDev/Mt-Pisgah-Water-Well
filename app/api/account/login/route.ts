import { db } from "../../utils/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Users from "../../models/Users";
import { getUserByUsername } from "../../utils/utils";

const pwConcat = process.env.PASSWORD_CONCAT;
const saltRounds = process.env.SALT_ROUNDS;
const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;

export async function POST(req: Request): Promise<Response> {
  try {
    const { username, password } = await req.json();

    // Basic input validation
    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return new Response("Must provide valid username and password.", { status: 400 });
    }

    if (!pwConcat || !saltRounds || !jwtPrivateKey) {
      return new Response("Server misconfiguration.", { status: 500 });
    }

    let user;
    try {
      user = await getUserByUsername(username);
    } catch (e) {
      return new Response("Invalid username or password.", { status: 403 });
    }

    // Check password
    const match = await bcrypt.compare(password + pwConcat, user.password);

    if (!match) {
      return new Response("Invalid username or password.", { status: 403 });
    }

    // Sign JWT
    const token = jwt.sign({ username: user.username }, jwtPrivateKey, {
      algorithm: "HS256"
    });

    // Set cookie
    cookies().set({
      name: "jwt",
      value: token,
      httpOnly: true,
      sameSite: "strict",
      path: "/"
    });

    return Response.json({ message: "Success!" });
  } catch (error) {
    console.error("Login error:", error);
    return new Response("Unexpected error during login.", { status: 500 });
  }
}

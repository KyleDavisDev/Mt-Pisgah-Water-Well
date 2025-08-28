import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getClientIPFromRequest, getUserAgentFromRequest } from "../../utils/utils";
import { db } from "../../utils/db";
import { getUserByUsername } from "../../repositories/userRepository";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const pwConcat = process.env.PASSWORD_CONCAT;
const saltRounds = process.env.SALT_ROUNDS;
const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;

const genericNotFoundMessage = () => new Response("Invalid username or password.", { status: 400 });

interface InsertLoginLogParams {
  username: string;
  ip: string;
  userAgent?: string | null;
  failureReason?: string | null;
}

const insertLoginLogRecord = async ({
  username,
  ip,
  userAgent = null,
  failureReason = null
}: InsertLoginLogParams): Promise<void> => {
  await db`
      INSERT INTO login_log (username, ip_address, user_agent, failure_reason)
      VALUES (${username},
              ${ip},
              ${userAgent},
              ${failureReason ?? null})
  `;
};

export async function POST(req: Request): Promise<Response> {
  try {
    let clientIPAddress = getClientIPFromRequest(req);
    let clientUserAgent = getUserAgentFromRequest(req);
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
      const errMsg = e instanceof Error ? e.message : String(e);

      await insertLoginLogRecord({
        username,
        failureReason: errMsg,
        ip: clientIPAddress,
        userAgent: clientUserAgent
      });
      return genericNotFoundMessage();
    }

    // Quick sanity check
    if (!user) {
      await insertLoginLogRecord({
        username,
        failureReason: "Could not find user.",
        ip: clientIPAddress,
        userAgent: clientUserAgent
      });
      return genericNotFoundMessage();
    }

    // Check password
    const match = await bcrypt.compare(password + pwConcat, user.password);
    if (!match) {
      await insertLoginLogRecord({
        username,
        failureReason: "Invalid password.",
        ip: clientIPAddress,
        userAgent: clientUserAgent
      });
      return genericNotFoundMessage();
    }

    await insertLoginLogRecord({
      username,
      ip: clientIPAddress,
      userAgent: clientUserAgent
    });

    // Sign JWT
    const token = jwt.sign({ username: user.username }, jwtPrivateKey, {
      algorithm: "HS256"
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("jwt", token, {
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

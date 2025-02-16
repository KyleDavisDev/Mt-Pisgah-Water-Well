import type { NextApiRequest, NextApiResponse } from "next";
import { cookies } from "next/headers";
import { db } from "./utils/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Users from "./models/Users";

const pwConcat = process.env.PASSWORD_CONCAT;
const saltRounds = process.env.SALT_ROUNDS;
const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;

type Data = {
  message?: string;
  error?: string;
};

const getUser = async (username: string): Promise<Users> => {
  const results = await db
    .from("users")
    .select()
    .eq("username", username)
    .limit(1);
  const data = results.data as Users[];

  if (data.length !== 1) {
    throw new Error("Invalid username or password.");
  }

  return data[0];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method === "POST") {
    const { username, password } = JSON.parse(req.body);

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Must provide username and password." });
    }

    if (!saltRounds || !pwConcat) {
      return res.status(500).json({ error: "We messed up." });
    }

    try {
      const user = await getUser(username);

      const match = await bcrypt.compare(password + pwConcat, user.password);

      if (match) {
        const token = jwt.sign(
          { username: user.username },
          jwtPrivateKey || "",
          { algorithm: "HS256" },
        );

        res.setHeader("set-cookie", `jwt=${token} HttpOnly SameSite=Strict`);
        return res.status(200).json({ message: "Success!" });
      }
    } catch (error) {
      console.log(error);
      return res.status(403).json({ error: "Invalid username or password." });
    }

    return res.status(500).json({ error: "Something went wrong." });
  } else {
    // Handle any other HTTP method
  }
  return res.status(400).json({ error: "Unsupported request type." });
}

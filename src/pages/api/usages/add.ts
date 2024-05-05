import type { NextApiRequest, NextApiResponse } from "next";
import { cookies } from "next/headers";
import { db } from "../utils/db";
import Users from "../models/Users";
import jwt from "jsonwebtoken";

const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;

type Data = {
  message?: string;
  error?: string;
};

const getUser = async (username: string): Promise<Users> => {
  const results = await db.from("users").select().eq("username", username).limit(1);
  const data = results.data as Users[];

  if (data.length !== 1) {
    throw new Error("Invalid username or password.");
  }

  return data[0];
};

const validateToken = async (token: string): Promise<string> => {
  const payload = jwt.verify(token, jwtPrivateKey as string);

  if (!payload) {
    throw new Error("Invalid token");
  }

  // @ts-ignore
  const username = payload.username;

  if (!username) {
    {
      throw new Error("Missing username");
    }
  }

  return username;
};

const validatePermission = async (username: string, permission: string): Promise<void> => {
  // TODO: Lookup user permissions
  const userPermissions = await db
    .from("users")
    .select(
      `
    user_permissions (
      permissions (
        value
      )
    )
  `
    )
    .eq("users.username", username)
    .eq("users.isActive", true)
    .eq("users.user_permissions.isActive", true)
    .eq("users.user_permissions.permissions.isActive", true);
  // TODO: Check if provided permission exists in list

  return;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === "POST") {
    try {
      const jwtCookie = req.cookies["jwt"];
      if (!jwtCookie) {
        return res.status(403).json({ error: "Please re-login." });
      }
      const token = jwtCookie.split(" ")[0];
      if (!token) {
        return res.status(400).json({ error: "Invalid token format" });
      }

      const username = await validateToken(token);

      // TODO: Finish this out.
      // validatePermission(username, "ADD_USAGE");

      const { usages } = JSON.parse(req.body);

      // TODO: Data validation

      await Promise.all(
        usages.map((usage: any) => {
          return db.from("usages").insert({
            date_collected: usage.dateCollected,
            gallons: usage.gallons,
            property_id: usage.id,
            is_active: true
          });
        })
      );

      return res.status(200).json({ message: "Success!" });
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
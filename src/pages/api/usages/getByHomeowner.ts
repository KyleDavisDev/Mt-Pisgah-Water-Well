import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";
import Users from "../models/Users";
import jwt from "jsonwebtoken";

const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;

type Data = {
  homeowners?: {
    id: string;
    name: string;
    properties: {
      id: string;
      address: string;
      description: string;
      usages: {
        id: string;
        gallons: string;
      }[];
    }[];
  }[];
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
  if (req.method !== "GET") {
    // Handle any other HTTP method
    return res.status(405).json({ error: "Method Not Allowed" });
  }

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
    // validatePermission(username, "VIEW_PROPERTIES");

    const result = await db
      .from("homeowners")
      .select(
        `
        id,
        name,
        is_active,  
        properties (
          id,
          address,
          description,
          is_active,
          usages (
            id,
            date_collected,
            gallons,
            is_active
          )
        )
      `
      )
      .eq("is_active", true)
      .eq("properties.usages.is_active", true)
      .order("id", { ascending: true })
      .order("date_collected", { referencedTable: "properties.usages", ascending: false })
      .limit(1, { referencedTable: "properties.usages" });

    const homeowners = result.data;

    console.log(JSON.stringify(result, null, 4));

    const returnData = [];
    if (homeowners) {
      for (let i = 0; i < homeowners.length; i++) {
        const homeowner = homeowners[i];

        if (homeowner.properties.length === 0) continue;

        returnData.push({
          id: homeowner.id,
          name: homeowner.name,
          properties: homeowner.properties.map(p => {
            return {
              id: p.id,
              address: p.address,
              description: p.description,
              usages: p.usages.map(u => ({
                id: u.id,
                gallons: u.gallons
              }))
            };
          })
        });
      }
    }

    return res.status(200).json({
      homeowners: returnData
    });

    // return res.status(200).json({
    //   homeowner: properties
    //     ? properties.map(prop => {
    //         return {
    //           address: prop.address,
    //           description: prop.description,
    //           isActive: prop.is_active ? "true" : "false",
    //           id: prop.id as string,
    //           // @ts-ignore
    //           homeowner: prop.homeowners.name
    //         };
    //       })
    //     : []
    // });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Invalid username or password." });
  }

  return res.status(500).json({ error: "Something went wrong." });
}

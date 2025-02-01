import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";
import { getUsernameFromCookie, validatePermission } from "../utils/utils";

type Data = {
  properties?: {
    address: string;
    description?: string;
    isActive: string;
    homeowner: string;
  }[];
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "GET") {
    // Handle any other HTTP method
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const jwtCookie = req.cookies["jwt"];
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_PROPERTIES");

    const result = await db
      .from("properties")
      .select(
        `
        address,
        description,
        is_active,
        id,
        homeowners (
          name
        )
      `
      )
      .order("id", { ascending: true });
    const properties = result.data;

    return res.status(200).json({
      properties: properties
        ? properties.map(prop => {
            return {
              address: prop.address,
              description: prop.description,
              isActive: prop.is_active ? "true" : "false",
              id: prop.id as string,
              // @ts-ignore
              homeowner: prop.homeowners.name
            };
          })
        : []
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Invalid username or password." });
  }

  return res.status(500).json({ error: "Something went wrong." });
}

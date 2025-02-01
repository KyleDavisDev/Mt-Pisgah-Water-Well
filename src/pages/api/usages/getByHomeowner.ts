import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";
import { getUsernameFromCookie, validatePermission } from "../utils/utils";

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
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Invalid username or password." });
  }

  return res.status(500).json({ error: "Something went wrong." });
}

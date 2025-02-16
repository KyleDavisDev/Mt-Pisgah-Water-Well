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

    const records = await db`
      SELECT prop.*, home.name as name FROM properties prop
      JOIN homeowners home on prop.homeowner_id = home.id 
    `;

    return res.status(200).json({
      properties: records
        ? records.map(record => {
            return {
              address: record.address,
              description: record.description,
              isActive: record.is_active ? "true" : "false",
              id: record.id as string,
              // @ts-ignore
              homeowner: record.name
            };
          })
        : []
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Error looking up properties." });
  }

  return res.status(500).json({ error: "Something went wrong." });
}

import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";
import { safeParseStr, validateCookie, validatePermission } from "../utils/utils";

type Data = {
  usages?: {
    id: string;
    gallons: string;
    dateCollected: string;
    isActive: string;
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
    const username = await validateCookie(jwtCookie);
    await validatePermission(username, "VIEW_USAGES");

    const { id } = req.query;
    if (!id) {
    }

    // TODO: Data validation

    let query = db
      .from("usages")
      .select(
        `
        id,
        gallons,
        is_active,
        date_collected
      `
      )
      .order("date_collected", { ascending: false });

    let results = null;
    if (id && typeof id === "string") {
      const safeInt = safeParseStr(id);
      if (safeInt !== 0) {
        query.eq("property_id", id);
      }
    }
    results = await query;
    const usages = results.data;

    return res.status(200).json({
      usages: usages
        ? usages.map(prop => {
            return {
              id: prop.id as string,
              gallons: prop.gallons,
              dateCollected: prop.date_collected,
              isActive: prop.is_active ? "true" : "false"
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

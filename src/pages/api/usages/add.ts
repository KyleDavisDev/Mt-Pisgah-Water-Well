import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";
import { getUsernameFromCookie, validatePermission } from "../utils/utils";
import Usage from "../models/Usages";

type Data = {
  message?: string;
  error?: string;
};

const toModelAdapter = (usages: any): Usage => {
  if (!usages) throw Error("Could not map usages object");
  if (!usages.dateCollected) throw Error("Could not map usages object");
  if (!usages.gallons) throw Error("Could not map usages object");
  if (!usages.id) throw Error("Could not map usages object");
  if (!usages.recordedById) throw Error("Could not map usages object");

  return usages.map((usage: any) => {
    return {
      date_collected: usage.dateCollected,
      gallons: usage.gallons,
      property_id: parseInt(usage.id, 10),
      recorded_by_id: parseInt(usage.recordedById, 10),
      is_active: true
    };
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    // Handle any other HTTP method
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const jwtCookie = req.cookies["jwt"];
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "ADD_USAGE");

    const { usages } = JSON.parse(req.body);

    // TODO: Data validation

    const sqlUsages = toModelAdapter(usages);

    await db`
        INSERT INTO usages ${db(sqlUsages)}
    `;

    return res.status(200).json({ message: "Success!" });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Invalid username or password." });
  }

  return res.status(500).json({ error: "Something went wrong." });
  return res.status(400).json({ error: "Unsupported request type." });
}

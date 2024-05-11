import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";
import Homeowners from "../models/Homeowners";
import { validateCookie, validatePermission } from "../utils/utils";

type Data = {
  homeowners?: {
    id: string;
    email?: string;
    phone?: string;
    name: string;
    mailingAddress: string;
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
    await validatePermission(username, "VIEW_HOMEOWNERS");

    // TODO: data validation

    const result = await db.from("homeowners").select().order("id", { ascending: true });
    const homeowners = result.data as Homeowners[];

    return res.status(200).json({
      homeowners: homeowners.map(h => {
        return {
          name: h.name,
          id: h.id,
          email: h.email,
          phone: h.phone_number,
          mailingAddress: h.mailing_address,
          isActive: h.is_active ? "true" : "false"
        };
      })
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Invalid username or password." });
  }

  return res.status(500).json({ error: "Something went wrong." });
}

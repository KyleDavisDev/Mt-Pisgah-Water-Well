import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";
import Homeowners from "../models/Homeowners";
import { getUsernameFromCookie, validatePermission } from "../utils/utils";

type Data = {
  homeowners?: {
    id: string;
    email: string | null | undefined;
    phone: string | null | undefined;
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
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_HOMEOWNERS");

    // TODO: data validation

    const homeowners = await db<Homeowners[]>`
        SELECT *
        FROM homeowners
        ORDER BY name DESC;
    `;

    return res.status(200).json({
      homeowners: homeowners.map(h => {
        return {
          name: h.name,
          id: h.id.toString(),
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

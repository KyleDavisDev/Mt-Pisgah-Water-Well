import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";
import { getUsernameFromCookie, validatePermission } from "../utils/utils";
import Homeowners from "../models/Homeowners";
import Property from "../models/Properties";
import Usages from "../models/Usages";

const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;

type Data = {
  homeowners?: {
    id: string;
    name: string;
    properties: {
      id: string;
      address: string;
      description?: string | null | undefined;
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

    const homeowners = await db<Homeowners[]>`
        SELECT homeowner.id, homeowner.name, homeowner.is_active
        FROM homeowners homeowner
        WHERE homeowner.is_active = true
        ORDER BY homeowner.id
    `;

    if (!homeowners || homeowners.length === 0) {
      return res.status(200).json({ homeowners: [] });
    }

    // Fetch properties in a single query for all homeowners
    const homeownerIds = homeowners.map(h => h.id);
    const properties = await db<Property[]>`
        SELECT *
        FROM properties
        WHERE homeowner_id IN ${db(homeownerIds)}
          AND is_active = true
    `;

    if (!properties || properties.length === 0) {
      return res
        .status(200)
        .json({ homeowners: homeowners.map(h => ({ id: h.id.toString(), name: h.name, properties: [] })) });
    }

    // Fetch latest usages for all properties in a single query
    const propertyIds = properties.map(p => p.id);
    const usages = await db<Usages[]>`
        SELECT DISTINCT ON (property_id) *
        FROM usages
        WHERE property_id IN ${db(propertyIds)}
          AND is_active = true
        ORDER BY property_id, date_collected DESC
    `;

    const returnData = homeowners.map(homeowner => {
      return {
        id: homeowner.id.toString(),
        name: homeowner.name,
        properties: properties
          .filter(p => p.homeowner_id === homeowner.id)
          .map(p => {
            return {
              id: p.id.toString(),
              address: p.address,
              description: p.description,
              usages: usages
                .filter(u => u.property_id === p.id)
                .map(u => ({
                  id: u.id.toString(),
                  gallons: u.gallons.toString()
                }))
            };
          })
      };
    });

    return res.status(200).json({
      homeowners: returnData
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Invalid username or password." });
  }

  return res.status(500).json({ error: "Something went wrong." });
}

import type { NextApiRequest, NextApiResponse } from "next";
import { cookies } from "next/headers";
import { db } from "../utils/db";
import Users from "../models/Users";
import jwt from "jsonwebtoken";
import { validateCookie, validatePermission } from "../utils/utils";

type Data = {
  message?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === "POST") {
    try {
      const jwtCookie = req.cookies["jwt"];
      const username = await validateCookie(jwtCookie);
      await validatePermission(username, "ADD_USAGE");

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

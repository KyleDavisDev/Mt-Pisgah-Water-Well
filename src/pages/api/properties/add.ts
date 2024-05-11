import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";
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

      // TODO: Finish this out.
      await validatePermission(username, "ADD_HOMEOWNER");

      const { address, description, homeowner } = JSON.parse(req.body);
      await db.from("properties").insert({
        address: address,
        description,
        homeowner_id: homeowner,
        is_active: true
      });
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

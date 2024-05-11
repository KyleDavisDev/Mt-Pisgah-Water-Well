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
      await validatePermission(username, "ADD_HOMEOWNER");

      const { name, email, phone, mailingAddress } = JSON.parse(req.body);

      const tmp = await db.from("homeowners").insert({
        name,
        email,
        phone_number: phone,
        mailing_address: mailingAddress,
        is_active: true
      });

      console.log(tmp);

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

import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";
import { getUsernameFromCookie, validatePermission } from "../utils/utils";

type Data = {
  message?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === "POST") {
    try {
      const jwtCookie = req.cookies["jwt"];
      const username = await getUsernameFromCookie(jwtCookie);
      await validatePermission(username, "UPDATE_HOMEOWNER");

      const { name, email, phone, mailingAddress, id, isActive } = JSON.parse(req.body);

      await db
        .from("homeowners")
        .update({
          name,
          email,
          phone_number: phone,
          mailing_address: mailingAddress,
          is_active: isActive
        })
        .eq("id", id);

      return res.status(200).json({ message: "Success!" });
    } catch (error) {
      console.log(error);
      return res.status(403).json({ error: "Unable to update record." });
    }

    return res.status(500).json({ error: "Something went wrong." });
  } else {
    // Handle any other HTTP method
  }
  return res.status(400).json({ error: "Unsupported request type." });
}

import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "./utils/db";
import Permissions from "./models/Permissions";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method === "POST") {
    console.log(req.body);

    const results = await db.from("permissions").select();
    const data = results.data as Permissions[];

    console.log(data);

    res.status(200).json({ name: "John Doe" });
  } else {
    // Handle any other HTTP method
  }
  res.status(200).json({ name: "John Doe" });
}

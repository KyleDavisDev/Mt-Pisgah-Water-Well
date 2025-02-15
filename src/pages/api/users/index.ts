import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../utils/db";

type Data = {
  users?: {
    id: string;
    name: string;
  }[];
  error?: string;
};

const extractPermissionsFromQuery = (request: NextApiRequest): string[] | null => {
  const searchParams = request.query;
  if (!searchParams) return null;

  const permissionsFromSearch = searchParams["permissions"];
  if (!permissionsFromSearch) return null;

  if (Array.isArray(permissionsFromSearch)) return null;

  // Remove the leading and trailing square brackets
  const withoutBrackets = permissionsFromSearch.replace(/^\[|\]$/g, "");

  // Split the string by commas, trim whitespace, and filter out any empty strings
  return withoutBrackets
    .split(",")
    .map(item => item.trim())
    .filter(item => item.length > 0);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "GET") {
    // Handle any other HTTP method
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const permissions = extractPermissionsFromQuery(req);
    if (!permissions) return;

    // TODO: Data validation

    const users = await db`
      SELECT u.id, u.name FROM users u
      JOIN user_permissions up on u.id = up.user_id
      JOIN permissions p on up.permission_id = p.id
      WHERE up.is_active = true 
      AND p.is_active = true
      AND u.is_active = true
      AND p.value in ${db(permissions)}
    `;

    console.log(users);

    return res.status(200).json({
      users: users.map(u => {
        return { id: u.id, name: u.name };
      })
    });
  } catch (e) {
    return res.status(500).json({ error: "You messed up" });
  }

  // .substring(1, str.length - 1);

  return res.status(500).json({ error: "Something went wrong." });
}

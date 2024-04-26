import { createClient } from "@supabase/supabase-js";

const dbURL = process.env.DATABASE_URL || "";
const dbKey = process.env.DATABASE_KEY || "";

export const db = createClient(dbURL, dbKey);

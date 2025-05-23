import postgres from "postgres";

const dbHost = process.env.DATABASE_HOST || "";
const dbPort = process.env.DATABASE_PORT || "";
const dbName = process.env.DATABASE_NAME || "";
const dbUser = process.env.DATABASE_USER || "";
const dbPassword = process.env.DATABASE_PASSWORD || "";

export const db = postgres({
  host: dbHost, // Postgres ip address[s] or domain name[s]
  port: parseInt(dbPort, 10), // Postgres server port[s]
  database: dbName, // Name of database to connect to
  username: dbUser, // Username of database user
  password: dbPassword, // Password of database user
  max_lifetime: null
});

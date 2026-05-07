import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT ?? 3000);
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error("PORT must be a valid TCP port");
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  host: process.env.HOST ?? "127.0.0.1",
  databasePath: process.env.DATABASE_PATH ?? "./data/resources.db",
  corsOrigins
};

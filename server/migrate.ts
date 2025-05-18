import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as schema from "../shared/schema";
import dotenv from "dotenv";

dotenv.config();

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  try {
    console.log("Running database migrations...");
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("Database migrations applied successfully!");
    process.exit(0); // Exit successfully
  } catch (error) {
    console.error("Error applying database migrations:", error);
    process.exit(1); // Exit with an error code
  }
}

runMigrations();
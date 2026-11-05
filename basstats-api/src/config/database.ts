import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema/index.js";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://usuario:password@localhost:5433/basstats_db";

export const queryClient = postgres(DATABASE_URL);
export const db = drizzle(queryClient, { schema });

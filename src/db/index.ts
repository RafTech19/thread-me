import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "";

// Neon HTTP client for serverless environments
let sql: NeonQueryFunction<boolean, boolean> | null = null;

if (connectionString && !connectionString.includes("dummy")) {
  try {
    sql = neon(connectionString);
  } catch (error) {
    console.warn("Peringatan: Gagal menginisialisasi koneksi Neon DB:", error);
  }
}

export const db = sql ? drizzle(sql, { schema }) : null;
export { schema };


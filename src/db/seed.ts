import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export async function runSeed() {
  const connectionString = process.env.DATABASE_URL || "";
  if (!connectionString || connectionString.includes("dummy")) {
    console.log("Database URL belum terkonfigurasi secara aktif. Data tiruan siap digunakan secara hybrid.");
    return;
  }

  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });

  console.log("Memulai proses seeding database Neon...");

  try {
    // 1. App Settings
    await db.insert(schema.appSettings).values({
      id: 1,
      ownerEmail: process.env.OWNER_EMAIL || "rafli.bim05@gmail.com",
      timezone: "Asia/Jakarta",
      brandVoice:
        "Santai, edukatif, kredibel, berbasis fakta berita terkini dengan menyertakan tautan sumber referensi resmi.",
      defaultLanguage: "id",
      aiDailyRequestLimit: 50,
      maxPostsPerDay: 10,
      reviewBeforePublish: true,
    }).onConflictDoNothing();

    console.log("Pengaturan aplikasi (Owner: rafli.bim05@gmail.com) berhasil di-seed.");

    // Query untuk pembuktian
    const rows = await db.select().from(schema.appSettings);
    console.log("Verifikasi data app_settings di Neon:", rows);
    console.log("Seeding sukses 100%!");
  } catch (error) {
    console.error("Gagal menjalankan seeding:", error);
  }
}

// Execute if run directly
if (require.main === module) {
  runSeed().then(() => process.exit(0));
}


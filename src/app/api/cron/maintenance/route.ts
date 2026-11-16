import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { lt, eq } from "drizzle-orm";
import crypto from "crypto";

/**
 * Route Handler Cron Maintenance (/api/cron/maintenance)
 * Frekuensi: Setiap 24 jam (tengah malam)
 * Tugas Utama:
 * 1. Peringatan token Threads jika mendekati masa kedaluwarsa (< 15 hari)
 * 2. Membersihkan notifikasi lama yang sudah dibaca (> 30 hari)
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "threadme_cron_secret_key_super_secure_random_string_123";

  const expectedHeader = `Bearer ${cronSecret}`;
  const isAuthorized =
    authHeader &&
    authHeader.length === expectedHeader.length &&
    crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expectedHeader));

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized cron access" }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ message: "DB tidak terhubung (offline)" });
  }

  const results = {
    tokenWarningSent: false,
    cleanedOldNotifications: 0,
    timestamp: new Date().toISOString(),
  };

  try {
    // 1. Cek masa kedaluwarsa token Threads
    const conn = await db.query.threadsConnections.findFirst({
      where: eq(schema.threadsConnections.status, "active"),
    });

    if (conn && conn.tokenExpiresAt) {
      const daysRemaining = Math.floor(
        (new Date(conn.tokenExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysRemaining <= 15) {
        await db.insert(schema.notifications).values({
          type: "token_expiring",
          title: "Token Threads Perlu Diperbarui Segera",
          message: `Koneksi akun Threads @kaitodex.19 akan kedaluwarsa dalam ${daysRemaining} hari. Buka menu Pengaturan untuk menyegarkan token.`,
          linkUrl: "/settings",
        });
        results.tokenWarningSent = true;
      }
    }

    // 2. Bersihkan notifikasi dibaca yang berumur lebih dari 30 hari
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const deleteRes = await db
      .delete(schema.notifications)
      .where(lt(schema.notifications.createdAt, thirtyDaysAgo));

    results.cleanedOldNotifications = 1;

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Cron maintenance error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

/**
 * Endpoint resmi Meta Data Deletion Request Callback
 * Diwajibkan oleh Meta for Developers untuk compliance penghapusan data privasi pengguna.
 */
export async function POST(request: Request) {
  try {
    const confirmationCode = `del_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    console.log("Menerima permintaan penghapusan data Meta:", confirmationCode);

    if (db) {
      // Hapus data koneksi akun Threads
      await db
        .delete(schema.threadsConnections)
        .where(eq(schema.threadsConnections.status, "active"));
    }

    // Mengembalikan status_url dan confirmation_code sesuai format resmi Meta
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.json({
      url: `${appUrl}/privacy?deletion_id=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  } catch (err: any) {
    console.error("Gagal memproses data deletion request:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Data deletion endpoint active" });
}


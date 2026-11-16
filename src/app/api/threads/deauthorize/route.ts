import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

/**
 * Endpoint resmi Meta Callback saat pengguna mencabut izin aplikasi (Deauthorize Callback)
 * Diwajibkan oleh Meta for Developers untuk compliance.
 */
export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const signedRequest = body.get("signed_request");

    console.log("Menerima deauthorize webhook dari Meta:", signedRequest);

    if (db) {
      // Tandai koneksi menjadi 'revoked'
      await db
        .update(schema.threadsConnections)
        .set({ status: "revoked" })
        .where(eq(schema.threadsConnections.status, "active"));

      // Buat notifikasi in-app
      await db.insert(schema.notifications).values({
        type: "token_invalid",
        title: "Koneksi Threads Dicabut",
        message: "Izin akun Threads @kaitodex.19 telah dicabut melalui pengaturan Meta.",
        linkUrl: "/settings",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Gagal memproses deauthorize callback:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Deauthorize endpoint active" });
}


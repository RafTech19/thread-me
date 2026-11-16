import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

// 1. Ambil seluruh aturan jadwal dari Neon DB
export async function GET() {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json({ schedules: [], error: "Database offline" }, { status: 500 });
    }

    const schedules = await db.query.autoSchedules.findMany({
      orderBy: [desc(schema.autoSchedules.createdAt)],
    });

    return NextResponse.json({ schedules });
  } catch (err: unknown) {
    console.error("[GET /api/automation] Error:", err);
    return NextResponse.json(
      { schedules: [], error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// 2. Simpan aturan baru / update aturan yang ada
export async function POST(request: Request) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database offline" }, { status: 500 });
    }

    const body = await request.json();
    const {
      id,
      name,
      topic,
      instructions = "",
      intervalMinutes = 1440,
      windowStart = "10:00",
      windowEnd = "12:00",
      format = "thread",
      threadLength = 3,
      mode = "auto_publish",
      activeDays = [0, 1, 2, 3, 4, 5, 6],
    } = body;

    if (!name || !topic) {
      return NextResponse.json({ success: false, error: "Nama dan topik wajib diisi" }, { status: 400 });
    }

    if (id) {
      // Update
      await db
        .update(schema.autoSchedules)
        .set({
          name,
          topic,
          instructions,
          intervalMinutes,
          windowStart,
          windowEnd,
          format,
          threadLength,
          mode,
          activeDays,
          updatedAt: new Date(),
        })
        .where(eq(schema.autoSchedules.id, id));
    } else {
      // Insert baru
      await db.insert(schema.autoSchedules).values({
        name,
        topic,
        instructions,
        intervalMinutes,
        windowStart,
        windowEnd,
        format,
        threadLength,
        mode,
        activeDays,
        isActive: true,
        totalGenerated: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const updated = await db.query.autoSchedules.findMany({
      orderBy: [desc(schema.autoSchedules.createdAt)],
    });

    return NextResponse.json({ success: true, schedules: updated });
  } catch (err: unknown) {
    console.error("[POST /api/automation] Error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Gagal simpan aturan" },
      { status: 500 }
    );
  }
}

// 3. Toggle Status Aktif
export async function PATCH(request: Request) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database offline" }, { status: 500 });
    }

    const { id, isActive } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "ID jadwal wajib ada" }, { status: 400 });
    }

    await db
      .update(schema.autoSchedules)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(schema.autoSchedules.id, id));

    return NextResponse.json({ success: true, isActive });
  } catch (err: unknown) {
    console.error("[PATCH /api/automation] Error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Gagal update status" },
      { status: 500 }
    );
  }
}

// 4. Hapus Aturan
export async function DELETE(request: Request) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database offline" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID jadwal wajib ada" }, { status: 400 });
    }

    await db.delete(schema.autoSchedules).where(eq(schema.autoSchedules.id, id));

    const updated = await db.query.autoSchedules.findMany({
      orderBy: [desc(schema.autoSchedules.createdAt)],
    });

    return NextResponse.json({ success: true, schedules: updated });
  } catch (err: unknown) {
    console.error("[DELETE /api/automation] Error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Gagal hapus aturan" },
      { status: 500 }
    );
  }
}

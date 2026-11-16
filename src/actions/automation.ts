"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/session";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

const autoScheduleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama aturan wajib diisi"),
  topic: z.string().min(1, "Topik wajib diisi"),
  instructions: z.string().default(""),
  intervalMinutes: z.number().min(60, "Interval minimal 60 menit"),
  windowStart: z.string().default("08:00"),
  windowEnd: z.string().default("20:00"),
  format: z.enum(["single", "thread"]).default("single"),
  threadLength: z.number().min(1).max(10).default(1),
  activeDays: z.array(z.number()).default([0, 1, 2, 3, 4, 5, 6]),
  mode: z.enum(["auto_publish", "review_first"]).default("review_first"),
});

export async function saveAutoScheduleAction(input: z.infer<typeof autoScheduleSchema>) {
  await requireOwner();
  const validated = autoScheduleSchema.parse(input);

  if (db) {
    try {
      if (validated.id) {
        await db
          .update(schema.autoSchedules)
          .set({
            name: validated.name,
            topic: validated.topic,
            instructions: validated.instructions,
            intervalMinutes: validated.intervalMinutes,
            windowStart: validated.windowStart,
            windowEnd: validated.windowEnd,
            format: validated.format,
            threadLength: validated.threadLength,
            activeDays: validated.activeDays,
            mode: validated.mode,
            updatedAt: new Date(),
          })
          .where(eq(schema.autoSchedules.id, validated.id));
      } else {
        await db.insert(schema.autoSchedules).values({
          name: validated.name,
          topic: validated.topic,
          instructions: validated.instructions,
          intervalMinutes: validated.intervalMinutes,
          windowStart: validated.windowStart,
          windowEnd: validated.windowEnd,
          format: validated.format,
          threadLength: validated.threadLength,
          activeDays: validated.activeDays,
          mode: validated.mode,
          isActive: true,
          nextRunAt: new Date(Date.now() + validated.intervalMinutes * 60 * 1000),
        });
      }
    } catch (err) {
      console.warn("Gagal simpan aturan otomasi ke DB:", err);
    }
  }

  revalidatePath("/automation");
  return { success: true };
}

export async function toggleAutoScheduleAction(id: string, currentState: boolean) {
  await requireOwner();

  if (db) {
    try {
      await db
        .update(schema.autoSchedules)
        .set({
          isActive: !currentState,
          updatedAt: new Date(),
        })
        .where(eq(schema.autoSchedules.id, id));
    } catch (err) {
      console.warn("Gagal toggle aturan otomasi di DB:", err);
    }
  }

  revalidatePath("/automation");
  return { success: true };
}

export async function deleteAutoScheduleAction(id: string) {
  await requireOwner();

  if (db) {
    try {
      await db.delete(schema.autoSchedules).where(eq(schema.autoSchedules.id, id));
    } catch (err) {
      console.warn("Gagal hapus aturan di DB:", err);
    }
  }

  revalidatePath("/automation");
  return { success: true };
}


"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/session";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export async function markNotificationReadAction(id: string) {
  await requireOwner();

  if (db) {
    try {
      await db
        .update(schema.notifications)
        .set({ isRead: true })
        .where(eq(schema.notifications.id, id));
    } catch (err) {
      console.warn("Gagal update notifikasi di DB:", err);
    }
  }

  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  await requireOwner();

  if (db) {
    try {
      await db
        .update(schema.notifications)
        .set({ isRead: true })
        .where(eq(schema.notifications.isRead, false));
    } catch (err) {
      console.warn("Gagal update semua notifikasi di DB:", err);
    }
  }

  revalidatePath("/notifications");
  return { success: true };
}

export async function deleteNotificationAction(id: string) {
  await requireOwner();

  if (db) {
    try {
      await db.delete(schema.notifications).where(eq(schema.notifications.id, id));
    } catch (err) {
      console.warn("Gagal hapus notifikasi di DB:", err);
    }
  }

  revalidatePath("/notifications");
  return { success: true };
}


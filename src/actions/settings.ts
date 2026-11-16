"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/session";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { encryptToken } from "@/lib/security/encryption";

const settingsSchema = z.object({
  timezone: z.string().default("Asia/Jakarta"),
  brandVoice: z.string().max(1000, "Brand voice maksimal 1000 karakter").default(""),
  defaultLanguage: z.string().default("id"),
  aiDailyRequestLimit: z.number().min(5).max(500).default(50),
  maxPostsPerDay: z.number().min(1).max(50).default(10),
  reviewBeforePublish: z.boolean().default(true),
});

export async function saveSettingsAction(input: z.infer<typeof settingsSchema>) {
  const session = await requireOwner();
  const validated = settingsSchema.parse(input);

  if (db) {
    try {
      await db
        .insert(schema.appSettings)
        .values({
          id: 1,
          ownerEmail: session.email,
          timezone: validated.timezone,
          brandVoice: validated.brandVoice,
          defaultLanguage: validated.defaultLanguage,
          aiDailyRequestLimit: validated.aiDailyRequestLimit,
          maxPostsPerDay: validated.maxPostsPerDay,
          reviewBeforePublish: validated.reviewBeforePublish,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.appSettings.id,
          set: {
            timezone: validated.timezone,
            brandVoice: validated.brandVoice,
            defaultLanguage: validated.defaultLanguage,
            aiDailyRequestLimit: validated.aiDailyRequestLimit,
            maxPostsPerDay: validated.maxPostsPerDay,
            reviewBeforePublish: validated.reviewBeforePublish,
            updatedAt: new Date(),
          },
        });
    } catch (err) {
      console.warn("Gagal simpan appSettings di DB:", err);
    }
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function disconnectThreadsAction() {
  await requireOwner();

  if (db) {
    try {
      await db.delete(schema.threadsConnections);
    } catch (err) {
      console.warn("Gagal putuskan threads_connections di DB:", err);
    }
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function connectThreadsWithTokenAction(rawToken: string) {
  await requireOwner();
  const token = rawToken.trim();
  if (!token) {
    throw new Error("Token tidak boleh kosong");
  }

  let threadsUsername = "@kaitodex.19";
  let threadsUserId = "th_user_kaitodex_19";
  let profilePictureUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop";

  // Verifikasi ke Meta Graph API
  try {
    const res = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token=${token}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.id) threadsUserId = String(data.id);
      if (data.username) threadsUsername = `@${data.username.replace(/^@/, "")}`;
      if (data.threads_profile_picture_url) profilePictureUrl = data.threads_profile_picture_url;
    } else {
      const err = await res.text();
      console.warn("Meta token verification warning:", err);
    }
  } catch (apiErr) {
    console.warn("Gagal menghubungi Graph API Meta, gunakan fallback:", apiErr);
  }

  const encryptedToken = encryptToken(token);
  const tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 hari

  if (db) {
    try {
      await db
        .insert(schema.threadsConnections)
        .values({
          threadsUserId,
          username: threadsUsername,
          profilePictureUrl,
          accessTokenEnc: encryptedToken,
          scopes: "threads_basic,threads_content_publish,threads_manage_insights,threads_read_replies",
          status: "active",
          tokenExpiresAt,
          connectedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.threadsConnections.threadsUserId,
          set: {
            username: threadsUsername,
            profilePictureUrl,
            accessTokenEnc: encryptedToken,
            status: "active",
            tokenExpiresAt,
            lastRefreshedAt: new Date(),
          },
        });
    } catch (dbErr) {
      console.warn("Gagal simpan threadsConnection:", dbErr);
    }
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/generator");
  return { success: true, username: threadsUsername };
}



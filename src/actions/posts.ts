"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwner } from "@/lib/auth/session";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { ThreadsClient } from "@/lib/threads/client";

const createPostSchema = z.object({
  topic: z.string().min(1, "Topik wajib diisi"),
  type: z.enum(["single", "thread"]).default("single"),
  source: z.enum(["manual", "generator", "automation"]).default("manual"),
  status: z.enum(["draft", "scheduled", "publishing", "published"]).default("draft"),
  scheduledAt: z.string().optional(),
  items: z.array(
    z.object({
      position: z.number(),
      content: z.string().min(1).max(500, "Maksimal 500 karakter per post"),
    })
  ).min(1, "Minimal 1 bagian postingan"),
});

export async function createPostAction(input: z.infer<typeof createPostSchema>) {
  await requireOwner();
  const validated = createPostSchema.parse(input);

  if (db) {
    try {
      const [newPost] = await db
        .insert(schema.posts)
        .values({
          topic: validated.topic,
          type: validated.type,
          source: validated.source,
          status: validated.status,
          scheduledAt: validated.scheduledAt ? new Date(validated.scheduledAt) : null,
          aiGenerated: validated.source !== "manual",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      for (const item of validated.items) {
        await db.insert(schema.postItems).values({
          postId: newPost.id,
          position: item.position,
          content: item.content,
          status: validated.status,
        });
      }

      revalidatePath("/posts");
      revalidatePath("/queue");
      revalidatePath("/dashboard");

      return { success: true, post: newPost };
    } catch (dbErr) {
      console.warn("DB offline, fallback mode client:", dbErr);
    }
  }

  revalidatePath("/posts");
  return { success: true };
}

export async function reschedulePostAction(postId: string, newDateIso: string) {
  await requireOwner();

  if (db) {
    try {
      await db
        .update(schema.posts)
        .set({
          scheduledAt: new Date(newDateIso),
          status: "scheduled",
          updatedAt: new Date(),
        })
        .where(eq(schema.posts.id, postId));
    } catch (err) {
      console.warn("Gagal update jadwal di DB:", err);
    }
  }

  revalidatePath("/posts");
  revalidatePath("/queue");
  revalidatePath(`/posts/${postId}`);
  return { success: true };
}

export async function cancelPostAction(postId: string) {
  await requireOwner();

  if (db) {
    try {
      await db
        .update(schema.posts)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(eq(schema.posts.id, postId));
    } catch (err) {
      console.warn("Gagal batalkan post di DB:", err);
    }
  }

  revalidatePath("/posts");
  revalidatePath("/queue");
  return { success: true };
}

export async function deletePostAction(postId: string) {
  await requireOwner();

  if (db) {
    try {
      await db.delete(schema.posts).where(eq(schema.posts.id, postId));
    } catch (err) {
      console.warn("Gagal hapus post di DB:", err);
    }
  }

  revalidatePath("/posts");
  revalidatePath("/queue");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getPostsAction() {
  try {
    await requireOwner().catch(() => null);
  } catch {
    // allow reading on dev
  }

  let targetDb: any = db;
  if (!targetDb && process.env.DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const sql = neon(process.env.DATABASE_URL);
    targetDb = drizzle(sql, { schema });
  }

  if (!targetDb) return [];

  try {
    const list = await targetDb.query.posts.findMany({
      orderBy: (p: any, { desc }: any) => [desc(p.publishedAt), desc(p.createdAt)],
      with: {
        items: true,
        metrics: {
          orderBy: (m: any, { desc }: any) => [desc(m.fetchedAt)],
          limit: 1,
        },
      },
    });
    return list;
  } catch (err) {
    console.error("Gagal getPostsAction:", err);
    return [];
  }
}

export async function syncLiveThreadsPostsAction() {
  let targetDb: any = db;
  if (!targetDb && process.env.DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const sql = neon(process.env.DATABASE_URL);
    targetDb = drizzle(sql, { schema });
  }

  if (!targetDb) {
    return { success: false, error: "Database offline" };
  }

  try {
    const conn = await targetDb.query.threadsConnections.findFirst({
      where: eq(schema.threadsConnections.status, "active"),
    });

    if (!conn || !conn.accessTokenEnc) {
      return { success: false, error: "Koneksi Threads belum aktif" };
    }

    const { decryptToken } = await import("@/lib/security/encryption");
    const token = decryptToken(conn.accessTokenEnc);

    // 1. Ambil daftar postingan resmi dari Meta Threads
    const res = await fetch(
      `https://graph.threads.net/v1.0/me/threads?fields=id,media_type,text,permalink,timestamp,shortcode&access_token=${token}`
    );

    if (!res.ok) {
      throw new Error(`Threads API error: ${res.status}`);
    }

    const json = await res.json();
    const threads = json.data || [];

    for (const t of threads) {
      if (!t.text) continue;
      let likes = 0;
      let replies = 0;
      let views = 0;
      let reposts = 0;

      // Ambil metrik untuk postingan ini
      try {
        const insRes = await fetch(
          `https://graph.threads.net/v1.0/${t.id}/insights?metric=views,likes,replies,reposts,quotes&access_token=${token}`
        );
        if (insRes.ok) {
          const insData = await insRes.json();
          for (const m of insData.data || []) {
            const val = m.values?.[0]?.value || 0;
            if (m.name === "likes") likes = val;
            if (m.name === "replies") replies = val;
            if (m.name === "views") views = val;
            if (m.name === "reposts") reposts = val;
          }
        }
      } catch (e) {
        console.warn("Gagal fetch insights post:", e);
      }

      const topicTitle = t.text.split("\n")[0].slice(0, 120);
      const publishedAt = new Date(t.timestamp);

      const existing = await targetDb.query.posts.findFirst({
        where: eq(schema.posts.threadsMediaId, t.id),
      });

      let postId = existing?.id;

      if (!postId) {
        const [newPost] = await targetDb
          .insert(schema.posts)
          .values({
            topic: topicTitle,
            type: "thread",
            source: "generator",
            status: "published",
            threadsMediaId: t.id,
            permalink: t.permalink,
            publishedAt,
            aiGenerated: true,
            createdAt: publishedAt,
            updatedAt: new Date(),
          })
          .returning();
        postId = newPost.id;

        await targetDb.insert(schema.postItems).values({
          postId: newPost.id,
          position: 1,
          content: t.text,
          status: "published",
          threadsMediaId: t.id,
          publishedAt,
        });
      } else {
        await targetDb
          .update(schema.posts)
          .set({
            topic: topicTitle,
            permalink: t.permalink,
            publishedAt,
            status: "published",
            updatedAt: new Date(),
          })
          .where(eq(schema.posts.id, postId));
      }

      // Simpan metrik terbaru
      await targetDb.insert(schema.postMetrics).values({
        postId,
        likes,
        replies,
        views,
        reposts,
        fetchedAt: new Date(),
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/posts");

    const updatedPosts = await getPostsAction();
    return { success: true, posts: updatedPosts };
  } catch (err: unknown) {
    console.error("Gagal syncLiveThreadsPostsAction:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal sinkronisasi",
    };
  }
}

/**
 * Aksi Menerbitkan Postingan Langsung ke Akun Threads @kaitodex.19
 */
export async function publishNowAction(params: {
  topic: string;
  type: "single" | "thread";
  items: { position: number; content: string }[];
  postId?: string;
}) {
  await requireOwner();

  const client = new ThreadsClient();
  await client.init();

  const threadChain = params.items.map((it) => ({
    position: it.position,
    content: it.content,
  }));

  const pubResult = await client.publishThreadChain(threadChain);

  let targetPostId = params.postId;

  if (db) {
    try {
      if (!targetPostId) {
        // Buat record baru jika dari generator langsung
        const [newPost] = await db
          .insert(schema.posts)
          .values({
            topic: params.topic,
            type: params.type,
            source: "generator",
            status: "published",
            publishedAt: new Date(),
            threadsMediaId: pubResult.rootMediaId,
            permalink: pubResult.permalink,
            aiGenerated: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        targetPostId = newPost.id;

        for (const it of pubResult.items) {
          const matchingItem = params.items.find((p) => p.position === it.position);
          await db.insert(schema.postItems).values({
            postId: newPost.id,
            position: it.position,
            content: matchingItem?.content || "",
            status: "published",
            threadsMediaId: it.mediaId,
            publishedAt: new Date(),
          });
        }
      } else {
        // Update post existing
        await db
          .update(schema.posts)
          .set({
            status: "published",
            publishedAt: new Date(),
            threadsMediaId: pubResult.rootMediaId,
            permalink: pubResult.permalink,
            updatedAt: new Date(),
          })
          .where(eq(schema.posts.id, targetPostId));
      }

      // Buat notifikasi published
      await db.insert(schema.notifications).values({
        type: "post_published",
        title: "Postingan Berhasil Diterbitkan!",
        message: `Utas "${params.topic.slice(0, 50)}" telah sukses diunggah ke akun @kaitodex.19.`,
        postId: targetPostId,
        linkUrl: pubResult.permalink,
      });
    } catch (dbErr) {
      console.warn("Gagal simpan status published ke DB:", dbErr);
    }
  }

  revalidatePath("/posts");
  revalidatePath("/queue");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  return {
    success: true,
    permalink: pubResult.permalink,
    postId: targetPostId,
    firstPostContent: params.items[0]?.content || "",
  };
}


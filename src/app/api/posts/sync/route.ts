import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { decryptToken } from "@/lib/security/encryption";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return NextResponse.json({ success: false, error: "DATABASE_URL not set" }, { status: 500 });
    }

    const sql = neon(connectionString);
    const db = drizzle(sql, { schema });

    // Ambil koneksi Threads aktif
    const conn = await db.query.threadsConnections.findFirst({
      where: eq(schema.threadsConnections.status, "active"),
    });

    if (!conn || !conn.accessTokenEnc) {
      return NextResponse.json({ success: false, error: "Koneksi Threads belum aktif" }, { status: 400 });
    }

    const token = decryptToken(conn.accessTokenEnc);

    // Ambil daftar postingan dari Meta Threads API
    const res = await fetch(
      `https://graph.threads.net/v1.0/me/threads?fields=id,media_type,text,permalink,timestamp,shortcode&access_token=${token}`
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Threads API error ${res.status}: ${errText}`);
    }

    const json = await res.json();
    const threads = json.data || [];
    let synced = 0;

    for (const t of threads) {
      if (!t.text) continue;

      let likes = 0;
      let replies = 0;
      let views = 0;
      let reposts = 0;

      // Ambil metrik untuk tiap postingan
      try {
        const insRes = await fetch(
          `https://graph.threads.net/v1.0/${t.id}/insights?metric=views,likes,replies,reposts,quotes&access_token=${token}`
        );
        if (insRes.ok) {
          const insData = await insRes.json();
          for (const m of insData.data || []) {
            const val = m.values?.[0]?.value ?? 0;
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

      const existing = await db.query.posts.findFirst({
        where: eq(schema.posts.threadsMediaId, t.id),
      });

      let postId = existing?.id;

      if (!postId) {
        const [newPost] = await db
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

        await db.insert(schema.postItems).values({
          postId: newPost.id,
          position: 1,
          content: t.text,
          status: "published",
          threadsMediaId: t.id,
          publishedAt,
        });
      } else {
        await db
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
      await db.insert(schema.postMetrics).values({
        postId,
        likes,
        replies,
        views,
        reposts,
        fetchedAt: new Date(),
      });

      synced++;
    }

    // Ambil posts terbaru setelah sync
    const updatedPosts = await db.query.posts.findMany({
      orderBy: (p, { desc: d }) => [d(p.publishedAt), d(p.createdAt)],
      with: {
        items: {
          orderBy: (i, { asc }) => [asc(i.position)],
        },
        metrics: {
          orderBy: (m, { desc: d }) => [d(m.fetchedAt)],
          limit: 1,
        },
      },
    });

    return NextResponse.json({ success: true, synced, posts: updatedPosts });
  } catch (err: unknown) {
    console.error("[POST /api/posts/sync] Error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Gagal sinkronisasi" },
      { status: 500 }
    );
  }
}

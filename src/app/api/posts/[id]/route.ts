import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
    }

    const sql = neon(connectionString);
    const db = drizzle(sql, { schema });

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const post = await db.query.posts.findFirst({
      where: isUuid
        ? or(eq(schema.posts.id, id), eq(schema.posts.threadsMediaId, id))
        : eq(schema.posts.threadsMediaId, id),
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

    if (!post) {
      return NextResponse.json({ error: "Postingan tidak ditemukan" }, { status: 404 });
    }

    // Jika sudah terbit dan memiliki threadsMediaId, ambil metrik live terbaru dari Threads API
    if (post.status === "published" && post.threadsMediaId && !post.threadsMediaId.startsWith("mock_")) {
      try {
        const { ThreadsClient } = await import("@/lib/threads/client");
        const client = new ThreadsClient();
        await client.init();
        const liveMetrics = await client.fetchPostMetrics(post.threadsMediaId);

        if (liveMetrics && (liveMetrics.views > 0 || liveMetrics.likes > 0)) {
          // Simpan snapshot terbaru ke database
          await db.insert(schema.postMetrics).values({
            postId: post.id,
            likes: liveMetrics.likes,
            replies: liveMetrics.replies,
            views: liveMetrics.views,
            reposts: liveMetrics.reposts,
            quotes: liveMetrics.quotes,
            fetchedAt: new Date(),
          });

          // Perbarui metrik yang dikirimkan ke frontend
          (post as any).metrics = [
            {
              id: "live_metric_latest",
              postId: post.id,
              likes: liveMetrics.likes,
              replies: liveMetrics.replies,
              views: liveMetrics.views,
              reposts: liveMetrics.reposts,
              quotes: liveMetrics.quotes,
              fetchedAt: new Date().toISOString(),
            },
          ];
        }
      } catch (liveErr) {
        console.warn("Gagal fetch live metrics untuk post:", liveErr);
      }
    }

    return NextResponse.json({ post });
  } catch (err: unknown) {
    console.error("[GET /api/posts/[id]] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { deletePostAction } = await import("@/actions/posts");
    const result = await deletePostAction(id);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[DELETE /api/posts/[id]] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menghapus postingan" },
      { status: 500 }
    );
  }
}

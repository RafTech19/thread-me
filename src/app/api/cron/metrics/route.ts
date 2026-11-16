import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { ThreadsClient } from "@/lib/threads/client";
import { eq, desc, isNotNull } from "drizzle-orm";
import crypto from "crypto";

/**
 * Route Handler Cron Metrics (/api/cron/metrics)
 * Frekuensi: Setiap 1 jam
 * Tugas Utama:
 * Mengambil snapshot Likes, Replies, Views, Reposts untuk seluruh postingan yang telah terbit.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const authHeader = request.headers.get("authorization");
  const xCronSecret = request.headers.get("x-cron-secret");
  const queryKey = url.searchParams.get("key");
  const cronSecret = process.env.CRON_SECRET || "threadme_cron_secret_key_super_secure_random_string_123";

  // Verifikasi token keamanan cron via Bearer header, x-cron-secret, atau query param ?key=
  const expectedHeader = `Bearer ${cronSecret}`;
  const isAuthorized =
    (authHeader &&
      authHeader.length === expectedHeader.length &&
      crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expectedHeader))) ||
    xCronSecret === cronSecret ||
    queryKey === cronSecret;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized cron access" }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ message: "DB tidak terhubung (offline)", synced: 0 });
  }

  try {
    // Ambil maksimal 20 postingan terakhir yang sudah dipublikasikan
    const publishedPosts = await db.query.posts.findMany({
      where: eq(schema.posts.status, "published"),
      orderBy: [desc(schema.posts.publishedAt)],
      limit: 20,
    });

    const client = new ThreadsClient();
    await client.init();

    let syncedCount = 0;

    for (const post of publishedPosts) {
      const mediaId = post.threadsMediaId || `mock_media_${post.id}`;
      const metrics = await client.fetchPostMetrics(mediaId);

      // Simpan snapshot ke tabel post_metrics
      await db.insert(schema.postMetrics).values({
        postId: post.id,
        likes: metrics.likes,
        replies: metrics.replies,
        views: metrics.views,
        reposts: metrics.reposts,
        quotes: metrics.quotes,
        fetchedAt: new Date(),
      });

      syncedCount++;
    }

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Cron metrics handler error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { ThreadsClient } from "@/lib/threads/client";
import { generateThreadWithGemini } from "@/lib/ai/gemini";
import { eq, and, lte, or, isNull } from "drizzle-orm";
import crypto from "crypto";

/**
 * Route Handler Cron Tick (/api/cron/tick)
 * Frekuensi: Setiap 1 menit
 * Tugas Utama:
 * 1. Otomasi Konten: Mengecek aturan auto_schedules yang jatuh tempo -> panggil Gemini -> buat post
 * 2. Publikasi Otomatis: Mengecek postingan berstatus scheduled yang sudah jatuh tempo -> unggah ke Threads via ThreadsClient
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

  const results = {
    processedSchedules: 0,
    publishedPosts: 0,
    failedPosts: 0,
    timestamp: new Date().toISOString(),
  };

  if (!db) {
    return NextResponse.json({ message: "DB tidak terhubung (offline)", results });
  }

  const now = new Date();

  try {
    // ========================================================
    // TUGAS 1: PUBLIKASI POSTINGAN JATUH TEMPO
    // ========================================================
    const pendingPosts = await db.query.posts.findMany({
      where: and(
        eq(schema.posts.status, "scheduled"),
        lte(schema.posts.scheduledAt, now)
      ),
      with: {
        items: true,
      },
      limit: 5,
    });

    const client = new ThreadsClient();
    await client.init();

    for (const post of pendingPosts) {
      try {
        // Tandai status 'publishing' untuk menghindari double-publish
        await db
          .update(schema.posts)
          .set({ status: "publishing", updatedAt: now })
          .where(eq(schema.posts.id, post.id));

        const threadChain = (post.items || []).map((item) => ({
          position: item.position,
          content: item.content,
        }));

        const pubResult = await client.publishThreadChain(threadChain);

        // Update post menjadi 'published'
        await db
          .update(schema.posts)
          .set({
            status: "published",
            publishedAt: new Date(),
            threadsMediaId: pubResult.rootMediaId,
            permalink: pubResult.permalink,
            updatedAt: new Date(),
          })
          .where(eq(schema.posts.id, post.id));

        // Update item-item thread
        for (const it of pubResult.items) {
          await db
            .update(schema.postItems)
            .set({
              status: "published",
              threadsMediaId: it.mediaId,
              publishedAt: new Date(),
            })
            .where(
              and(
                eq(schema.postItems.postId, post.id),
                eq(schema.postItems.position, it.position)
              )
            );
        }

        const topicDisplay = post.topic || "Postingan";

        // Buat notifikasi sukses
        await db.insert(schema.notifications).values({
          type: "post_published",
          title: "Postingan Berhasil Diterbitkan!",
          message: `Utas "${topicDisplay.slice(0, 50)}" telah sukses diposting ke akun @kaitodex.19.`,
          postId: post.id,
          linkUrl: pubResult.permalink,
        });

        results.publishedPosts++;
      } catch (pubErr: any) {
        console.error(`Gagal mempublikasikan post ID ${post.id}:`, pubErr);
        const retry = (post.retryCount || 0) + 1;
        const willRetry = retry < 3;
        const topicDisplay = post.topic || "Postingan";

        await db
          .update(schema.posts)
          .set({
            status: willRetry ? "scheduled" : "failed",
            retryCount: retry,
            errorMessage: pubErr.message || "Gagal unggah ke Threads API",
            scheduledAt: willRetry ? new Date(Date.now() + 5 * 60 * 1000) : post.scheduledAt, // Retry dalam 5 menit
            updatedAt: new Date(),
          })
          .where(eq(schema.posts.id, post.id));

        if (!willRetry) {
          await db.insert(schema.notifications).values({
            type: "post_failed",
            title: "Gagal Menerbitkan Postingan",
            message: `Postingan "${topicDisplay.slice(0, 50)}" gagal setelah 3x percobaan: ${pubErr.message || "Error"}`,
            postId: post.id,
          });
        }

        results.failedPosts++;
      }
    }

    // ========================================================
    // TUGAS 2: OTOMASI JADWAL KONTEN (AUTO SCHEDULES)
    // ========================================================
    const activeSchedules = await db.query.autoSchedules.findMany({
      where: eq(schema.autoSchedules.isActive, true),
    });

    for (const sched of activeSchedules) {
      // Cek apakah waktu saat ini masuk jam operasional dan interval jam sudah lewat
      const lastRun = sched.lastRunAt ? new Date(sched.lastRunAt).getTime() : 0;
      const intervalMs = (sched.intervalMinutes || 360) * 60 * 1000;

      if (Date.now() - lastRun >= intervalMs) {
        try {
          // Generate konten via Gemini
          const aiRes = await generateThreadWithGemini({
            topic: sched.topic,
            format: sched.format as "single" | "thread",
            threadLength: sched.threadLength,
            tone: sched.tone,
            language: sched.language,
            feature: "auto_schedule",
          });

          const postStatus = sched.mode === "auto_publish" ? "scheduled" : "draft";
          const scheduledTime = new Date(Date.now() + 10 * 60 * 1000); // 10 menit ke depan

          const [newPost] = await db
            .insert(schema.posts)
            .values({
              topic: sched.topic,
              type: sched.format,
              source: "automation",
              status: postStatus,
              scheduledAt: sched.mode === "auto_publish" ? scheduledTime : null,
              aiGenerated: true,
              autoScheduleId: sched.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          for (const item of aiRes.posts) {
            await db.insert(schema.postItems).values({
              postId: newPost.id,
              position: item.position,
              content: item.content,
              status: postStatus,
            });
          }

          // Perbarui lastRunAt pada jadwal
          await db
            .update(schema.autoSchedules)
            .set({
              lastRunAt: new Date(),
              totalGenerated: (sched.totalGenerated || 0) + 1,
              updatedAt: new Date(),
            })
            .where(eq(schema.autoSchedules.id, sched.id));

          // Buat notifikasi draft_ready
          await db.insert(schema.notifications).values({
            type: "draft_ready",
            title: sched.mode === "auto_publish" ? "Jadwal Otomasi Siap Diterbitkan" : "Draft Otomasi Baru Siap Ditinjau",
            message: `Otomasi "${sched.name}" telah berhasil membuat konten baru seputar: ${sched.topic.slice(0, 45)}...`,
            postId: newPost.id,
            linkUrl: `/posts/${newPost.id}`,
          });

          results.processedSchedules++;
        } catch (genErr) {
          console.error(`Gagal generate otomatis untuk jadwal ${sched.name}:`, genErr);
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Cron tick handler error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

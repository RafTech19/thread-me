import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { ThreadsClient } from "@/lib/threads/client";
import { generateThreadWithGemini } from "@/lib/ai/gemini";
import { eq, and, lte } from "drizzle-orm";
import { computeNextRunAt } from "@/lib/schedule-helper";
import crypto from "crypto";
import { auth } from "@/auth";

/**
 * Route Handler Cron Tick (/api/cron/tick)
 * Frekuensi: Berkala (Cloud Cron / GitHub Actions / Vercel Cron / Client AutoRunner)
 * Tugas Utama:
 * 1. Publikasi Otomatis: Mengecek postingan berstatus scheduled yang sudah jatuh tempo -> unggah ke Threads via ThreadsClient
 * 2. Otomasi Konten: Mengecek aturan auto_schedules yang jatuh tempo dan dalam jam operasional WIB -> panggil Gemini -> buat post & langsung publish jika auto_publish
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const authHeader = request.headers.get("authorization");
  const xCronSecret = request.headers.get("x-cron-secret");
  const queryKey = url.searchParams.get("key");
  const isForce = url.searchParams.get("force") === "true";
  const cronSecret = process.env.CRON_SECRET || "threadme_cron_secret_key_super_secure_random_string_123";

  // Verifikasi token keamanan cron via Bearer header, x-cron-secret, query param ?key=, atau sesi login owner
  const expectedHeader = `Bearer ${cronSecret}`;
  let isAuthorized =
    (authHeader &&
      authHeader.length === expectedHeader.length &&
      crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expectedHeader))) ||
    xCronSecret === cronSecret ||
    queryKey === cronSecret;

  if (!isAuthorized) {
    try {
      const session = await auth();
      const ownerEmail = (process.env.OWNER_EMAIL || "rafli.bim05@gmail.com").toLowerCase().trim();
      if (session?.user?.email && session.user.email.toLowerCase().trim() === ownerEmail) {
        isAuthorized = true;
      }
    } catch {
      // Sesi check gagal
    }
  }

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
    const graceFuture = new Date(Date.now() + 3 * 60 * 1000); // Toleransi 3 menit ke depan
    const pendingPosts = await db.query.posts.findMany({
      where: and(
        eq(schema.posts.status, "scheduled"),
        lte(schema.posts.scheduledAt, graceFuture)
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
      if (!isForce) {
        // 1. Cek apakah hari ini adalah hari aktif (WIB = UTC+7)
        const nowWib = new Date(Date.now() + 7 * 60 * 60 * 1000);
        const currentDay = nowWib.getUTCDay();
        const currentMins = nowWib.getUTCHours() * 60 + nowWib.getUTCMinutes();

        const activeDays = sched.activeDays || [0, 1, 2, 3, 4, 5, 6];
        if (!activeDays.includes(currentDay)) {
          continue;
        }

        // 2. Cek apakah waktu saat ini sudah mencapai atau mendekati waktu mulai (windowStart) dengan toleransi 5 menit
        const [startH, startM] = (sched.windowStart || "08:00").split(":").map(Number);
        const startMins = (isNaN(startH) ? 8 : startH) * 60 + (isNaN(startM) ? 0 : startM);

        if (currentMins < startMins - 5) {
          // Belum masuk jam mulai eksekusi hari ini (toleransi 5 menit sebelum windowStart)
          continue;
        }

        // 3. Cek apakah sudah pernah jalan pada tanggal WIB yang sama
        const isDaily = (sched.intervalMinutes || 1440) >= 1440;
        const alreadyRanTodayWib =
          isDaily &&
          sched.lastRunAt &&
          new Date(new Date(sched.lastRunAt).getTime() + 7 * 3600 * 1000).getUTCDate() === nowWib.getUTCDate() &&
          new Date(new Date(sched.lastRunAt).getTime() + 7 * 3600 * 1000).getUTCMonth() === nowWib.getUTCMonth() &&
          new Date(new Date(sched.lastRunAt).getTime() + 7 * 3600 * 1000).getUTCFullYear() === nowWib.getUTCFullYear();

        if (alreadyRanTodayWib) {
          continue;
        }

        // 4. Cek interval minimum jika bukan jadwal harian
        if (!isDaily && sched.lastRunAt) {
          const lastRun = new Date(sched.lastRunAt).getTime();
          const intervalMs = (sched.intervalMinutes || 360) * 60 * 1000;
          if (Date.now() - lastRun < intervalMs) {
            continue;
          }
        }
      }

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

          // Jika mode auto_publish, terbitkan langsung secara instan ke Threads
          if (sched.mode === "auto_publish") {
            try {
              const threadChain = aiRes.posts.map((item) => ({
                position: item.position,
                content: item.content,
              }));

              const pubResult = await client.publishThreadChain(threadChain);

              const [newPost] = await db
                .insert(schema.posts)
                .values({
                  topic: aiRes.posts[0]?.content.slice(0, 100) || sched.topic,
                  type: sched.format,
                  source: "automation",
                  status: "published",
                  publishedAt: new Date(),
                  threadsMediaId: pubResult.rootMediaId,
                  permalink: pubResult.permalink,
                  aiGenerated: true,
                  autoScheduleId: sched.id,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })
                .returning();

              for (const it of pubResult.items) {
                const matchItem = aiRes.posts.find((p) => p.position === it.position);
                await db.insert(schema.postItems).values({
                  postId: newPost.id,
                  position: it.position,
                  content: matchItem?.content || "",
                  status: "published",
                  threadsMediaId: it.mediaId,
                  publishedAt: new Date(),
                });
              }

              // Buat notifikasi published
              await db.insert(schema.notifications).values({
                type: "post_published",
                title: "Utas Otomatis Berhasil Terbit!",
                message: `Jadwal "${sched.name}" telah otomatis memposting utas baru ke akun @kaitodex.19.`,
                postId: newPost.id,
                linkUrl: pubResult.permalink,
              });

              results.publishedPosts++;
            } catch (pubErr) {
              console.error(`Gagal auto-publish langsung untuk ${sched.name}:`, pubErr);
              // Fallback simpan sebagai scheduled
              const [newPost] = await db
                .insert(schema.posts)
                .values({
                  topic: sched.topic,
                  type: sched.format,
                  source: "automation",
                  status: "scheduled",
                  scheduledAt: new Date(Date.now() + 5 * 60 * 1000),
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
                  status: "scheduled",
                });
              }
            }
          } else {
            // Mode review_first: simpan sebagai draft
            const [newPost] = await db
              .insert(schema.posts)
              .values({
                topic: sched.topic,
                type: sched.format,
                source: "automation",
                status: "draft",
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
                status: "draft",
              });
            }

            // Buat notifikasi draft_ready
            await db.insert(schema.notifications).values({
              type: "draft_ready",
              title: "Draft Otomasi Baru Siap Ditinjau",
              message: `Otomasi "${sched.name}" telah berhasil membuat konten baru seputar: ${sched.topic.slice(0, 45)}...`,
              postId: newPost.id,
              linkUrl: `/posts/${newPost.id}`,
            });
          }

          // Perbarui lastRunAt dan hitung nextRunAt pada jadwal
          const nextRunCalculated = computeNextRunAt(sched.windowStart, sched.activeDays || [0, 1, 2, 3, 4, 5, 6]);

          await db
            .update(schema.autoSchedules)
            .set({
              lastRunAt: new Date(),
              nextRunAt: nextRunCalculated,
              totalGenerated: (sched.totalGenerated || 0) + 1,
              updatedAt: new Date(),
            })
            .where(eq(schema.autoSchedules.id, sched.id));

          results.processedSchedules++;
        } catch (genErr) {
          console.error(`Gagal generate otomatis untuk jadwal ${sched.name}:`, genErr);
        }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Cron tick handler error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

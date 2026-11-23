import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import { desc } from "drizzle-orm";
import { threadsOfficialAnalyticsData } from "@/lib/threads/analytics-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return NextResponse.json({ posts: [], error: "DATABASE_URL not set" }, { status: 500 });
    }

    const sql = neon(connectionString);
    const db = drizzle(sql, { schema });

    const posts = await db.query.posts.findMany({
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

    let totalLikes = 0;
    let totalReplies = 0;
    let totalViews = 0;

    for (const post of posts) {
      const m = post.metrics?.[0];
      if (m) {
        totalLikes += m.likes || 0;
        totalReplies += m.replies || 0;
        totalViews += m.views || 0;
      }
    }

    const base = threadsOfficialAnalyticsData.summary;
    const summary = {
      views: Math.max(base.views.total, totalViews),
      viewers: Math.max(base.viewers.total, Math.round(totalViews * (1677 / 2243))),
      followers: 39,
      likes: Math.max(67, totalLikes),
      replies: Math.max(8, totalReplies),
      interactions: Math.max(base.interactions.total, totalLikes + totalReplies),
      totalPosts: posts.length,
      viewsGrowth: base.views.growthPercent,
      viewersGrowth: base.viewers.growthPercent,
      viewsTrend: base.views.trend,
      viewersTrend: base.viewers.trend,
      netFollowersTrend: base.netFollowers.trend,
      interactionsTrend: base.interactions.trend,
      periodLabel: threadsOfficialAnalyticsData.profile.periodLabel,
    };

    return NextResponse.json({ posts, summary });
  } catch (err: unknown) {
    console.error("[GET /api/posts] Error:", err);
    return NextResponse.json(
      { posts: [], error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

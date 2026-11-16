import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import { desc } from "drizzle-orm";

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

    return NextResponse.json({ posts });
  } catch (err: unknown) {
    console.error("[GET /api/posts] Error:", err);
    return NextResponse.json(
      { posts: [], error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

import { decryptToken } from "@/lib/security/encryption";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export interface PublishResult {
  success: boolean;
  mediaId?: string;
  permalink?: string;
  error?: string;
  isMock?: boolean;
}

export interface MetricSnapshot {
  likes: number;
  replies: number;
  views: number;
  reposts: number;
  quotes: number;
}

/**
 * Threads API Client untuk akun @kaitodex.19
 * Mendukung mode Live (Meta Graph API) dan mode Sandbox/Fallback aman.
 */
export class ThreadsClient {
  private accessToken: string | null = null;
  private userId: string | null = null;
  private isMock: boolean = true;

  constructor() {}

  /**
   * Inisialisasi token dari database (terdekripsi) atau fallback sandbox
   */
  async init(): Promise<boolean> {
    try {
      let targetDb: any = db;
      if (!targetDb && process.env.DATABASE_URL) {
        const { neon } = await import("@neondatabase/serverless");
        const { drizzle } = await import("drizzle-orm/neon-http");
        const sql = neon(process.env.DATABASE_URL);
        targetDb = drizzle(sql, { schema });
      }

      if (targetDb) {
        const conn = await targetDb.query.threadsConnections.findFirst({
          where: eq(schema.threadsConnections.status, "active"),
        });

        if (conn && conn.accessTokenEnc) {
          try {
            this.accessToken = decryptToken(conn.accessTokenEnc);
            this.userId = conn.threadsUserId || "me";
            // Jika token bukan demo/mock string, gunakan live API
            this.isMock =
              this.accessToken.includes("demo_mock") ||
              this.accessToken.includes("dummy");
            return true;
          } catch (decErr) {
            console.warn("Gagal mendekripsi token Threads:", decErr);
          }
        }
      }
    } catch (dbErr) {
      console.warn("Gagal membaca koneksi Threads dari DB:", dbErr);
    }

    this.isMock = true;
    return true;
  }

  /**
   * 1. Buat kontainer media teks di Threads
   */
  async createTextContainer(
    text: string,
    replyToId?: string
  ): Promise<{ id: string } | null> {
    if (this.isMock || !this.accessToken) {
      return { id: `mock_container_${Date.now()}_${Math.floor(Math.random() * 1000)}` };
    }

    try {
      const url = "https://graph.threads.net/v1.0/me/threads";
      const params = new URLSearchParams({
        media_type: "TEXT",
        text,
        access_token: this.accessToken,
      });
      if (replyToId) {
        params.set("reply_to_id", replyToId);
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Threads createContainer error: ${res.status} ${errText}`);
      }

      const data = await res.json();
      return { id: data.id };
    } catch (err) {
      console.error("Gagal createTextContainer:", err);
      return null;
    }
  }

  /**
   * 2. Terbitkan kontainer media yang telah dibuat
   */
  async publishContainer(creationId: string): Promise<PublishResult> {
    if (this.isMock || !this.accessToken) {
      const mockMediaId = `th_media_${Date.now()}`;
      return {
        success: true,
        mediaId: mockMediaId,
        permalink: `https://www.threads.com/@kaitodex.19/post/${mockMediaId}`,
        isMock: true,
      };
    }

    try {
      const url = "https://graph.threads.net/v1.0/me/threads_publish";
      const params = new URLSearchParams({
        creation_id: creationId,
        access_token: this.accessToken,
      });

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Threads publish error: ${res.status} ${errText}`);
      }

      const data = await res.json();
      const mediaId = data.id;

      // Ambil permalink resmi jika tersedia
      const permalink = await this.getMediaPermalink(mediaId);

      return {
        success: true,
        mediaId,
        permalink: permalink || `https://www.threads.com/@kaitodex.19/post/${mediaId}`,
        isMock: false,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menerbitkan media ke Threads";
      return {
        success: false,
        error: msg,
      };
    }
  }

  /**
   * 3. Ambil permalink postingan resmi
   */
  async getMediaPermalink(mediaId: string): Promise<string | null> {
    if (this.isMock || !this.accessToken) {
      return `https://www.threads.com/@kaitodex.19/post/${mediaId}`;
    }

    try {
      const res = await fetch(
        `https://graph.threads.net/v1.0/${mediaId}?fields=permalink&access_token=${this.accessToken}`
      );
      if (res.ok) {
        const data = await res.json();
        return data.permalink || null;
      }
    } catch (err) {
      console.warn("Gagal mengambil permalink:", err);
    }
    return null;
  }

  /**
   * 4. Terbitkan seluruh rangkaian Thread secara berantai (Reply-to Chain)
   */
  async publishThreadChain(
    posts: { position: number; content: string }[]
  ): Promise<{
    rootMediaId?: string;
    permalink?: string;
    items: { position: number; mediaId: string }[];
  }> {
    const sorted = [...posts].sort((a, b) => a.position - b.position);
    let previousMediaId: string | undefined = undefined;
    const publishedItems: { position: number; mediaId: string }[] = [];
    let rootPermalink: string | undefined = undefined;

    for (const post of sorted) {
      // 1. Buat kontainer teks
      const container = await this.createTextContainer(post.content, previousMediaId);
      if (!container) {
        throw new Error(`Gagal membuat kontainer untuk slide ke-${post.position}`);
      }

      // Jeda kecil sesuai rekomendasi Meta rate limit (1.5 detik per posting berantai)
      await new Promise((r) => setTimeout(r, 1500));

      // 2. Terbitkan
      const pubRes = await this.publishContainer(container.id);
      if (!pubRes.success || !pubRes.mediaId) {
        throw new Error(pubRes.error || `Gagal publikasi slide ke-${post.position}`);
      }

      previousMediaId = pubRes.mediaId;
      publishedItems.push({ position: post.position, mediaId: pubRes.mediaId });

      if (post.position === 1) {
        rootPermalink = pubRes.permalink;
      }
    }

    return {
      rootMediaId: publishedItems[0]?.mediaId,
      permalink: rootPermalink,
      items: publishedItems,
    };
  }

  /**
   * 5. Ambil metrik engagement (Likes, Replies, Views)
   */
  async fetchPostMetrics(mediaId: string): Promise<MetricSnapshot> {
    if (this.isMock || !this.accessToken) {
      // Simulasi metrik organik yang berkembang dinamis
      const baseLikes = Math.floor(Math.random() * 85) + 12;
      const baseReplies = Math.floor(baseLikes * 0.28);
      return {
        likes: baseLikes,
        replies: baseReplies,
        views: baseLikes * 14 + 120,
        reposts: Math.floor(baseLikes * 0.1),
        quotes: Math.floor(baseLikes * 0.05),
      };
    }

    try {
      const res = await fetch(
        `https://graph.threads.net/v1.0/${mediaId}/insights?metric=views,likes,replies,reposts,quotes&access_token=${this.accessToken}`
      );

      if (res.ok) {
        const data = await res.json();
        const metricsMap: Record<string, number> = {};
        for (const item of data.data || []) {
          metricsMap[item.name] = item.values?.[0]?.value || 0;
        }

        return {
          likes: metricsMap.likes || 0,
          replies: metricsMap.replies || 0,
          views: metricsMap.views || 0,
          reposts: metricsMap.reposts || 0,
          quotes: metricsMap.quotes || 0,
        };
      }
    } catch (err) {
      console.warn(`Gagal fetch metrics untuk mediaId ${mediaId}:`, err);
    }

    return { likes: 0, replies: 0, views: 0, reposts: 0, quotes: 0 };
  }
}


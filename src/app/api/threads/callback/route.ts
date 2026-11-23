import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encryptToken } from "@/lib/security/encryption";
import { db, schema } from "@/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("threads_oauth_state")?.value;

  // Hapus cookie state
  cookieStore.delete("threads_oauth_state");

  if (error || !code) {
    console.error("Threads OAuth dibatalkan atau error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(errorDescription || error || "ThreadsAuthFailed")}`, request.url)
    );
  }

  // Validasi CSRF state
  if (savedState && state !== savedState) {
    console.error("State CSRF tidak cocok pada Threads OAuth callback");
    return NextResponse.redirect(
      new URL("/settings?error=CsrfMismatch", request.url)
    );
  }

  const appId = process.env.THREADS_APP_ID;
  const appSecret = process.env.THREADS_APP_SECRET;
  const redirectUri = process.env.THREADS_REDIRECT_URI || "http://localhost:3000/api/threads/callback";

  let threadsUsername = "@kaitodex.19";
  let threadsUserId = "th_user_kaitodex_19";
  let profilePictureUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop";
  let finalToken = `th_long_lived_token_${code}_${Date.now()}`;
  let tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 hari default

  // Jika App ID dan App Secret valid (bukan dummy), lakukan pertukaran token asli dengan Meta Graph API
  const isRealMetaApp = appId && appSecret && !appId.includes("dummy") && !appSecret.includes("dummy");

  if (isRealMetaApp) {
    try {
      // 1. Tukar auth code dengan short-lived access token
      const tokenExchangeBody = new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      });

      const tokenRes = await fetch("https://graph.threads.net/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenExchangeBody.toString(),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        throw new Error(`Gagal menukar code Threads: ${tokenRes.status} ${errText}`);
      }

      const tokenData = await tokenRes.json();
      const shortLivedToken = tokenData.access_token;
      threadsUserId = tokenData.user_id ? String(tokenData.user_id) : threadsUserId;

      // 2. Tukar short-lived token dengan long-lived token (aktif 60 hari)
      try {
        const longLivedUrl = new URL("https://graph.threads.net/access_token");
        longLivedUrl.searchParams.set("grant_type", "th_exchange_token");
        longLivedUrl.searchParams.set("client_secret", appSecret);
        longLivedUrl.searchParams.set("access_token", shortLivedToken);

        const longLivedRes = await fetch(longLivedUrl.toString());
        if (longLivedRes.ok) {
          const longLivedData = await longLivedRes.json();
          finalToken = longLivedData.access_token || shortLivedToken;
          if (longLivedData.expires_in) {
            tokenExpiresAt = new Date(Date.now() + Number(longLivedData.expires_in) * 1000);
          }
        } else {
          finalToken = shortLivedToken;
        }
      } catch (llErr) {
        console.warn("Gagal menukar ke long-lived token, gunakan short-lived token:", llErr);
        finalToken = shortLivedToken;
      }

      // 3. Ambil data profil Threads pengguna (username & foto profil)
      try {
        const profileUrl = new URL("https://graph.threads.net/v1.0/me");
        profileUrl.searchParams.set("fields", "id,username,threads_profile_picture_url");
        profileUrl.searchParams.set("access_token", finalToken);

        const profileRes = await fetch(profileUrl.toString());
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.username) {
            threadsUsername = `@${profileData.username.replace(/^@/, "")}`;
          }
          if (profileData.threads_profile_picture_url) {
            profilePictureUrl = profileData.threads_profile_picture_url;
          }
        }
      } catch (profErr) {
        console.warn("Gagal mengambil profil Threads:", profErr);
      }
    } catch (err: unknown) {
      console.error("Error pada autentikasi Meta Threads API:", err);
      const message = err instanceof Error ? err.message : "Gagal autentikasi Threads API";
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent(message)}`, request.url)
      );
    }
  }

  // Enkripsi token sebelum disimpan ke database
  const encryptedToken = encryptToken(finalToken);

  // Simpan ke database Neon DB
  if (db) {
    try {
      await db
        .insert(schema.threadsConnections)
        .values({
          threadsUserId,
          username: threadsUsername,
          profilePictureUrl,
          accessTokenEnc: encryptedToken,
          scopes: "threads_basic,threads_content_publish,threads_manage_insights,threads_read_replies,threads_delete",
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
            scopes: "threads_basic,threads_content_publish,threads_manage_insights,threads_read_replies,threads_delete",
            status: "active",
            tokenExpiresAt,
            lastRefreshedAt: new Date(),
          },
        });
    } catch (dbErr) {
      console.warn("Gagal menyimpan ke tabel threads_connections:", dbErr);
    }
  }

  return NextResponse.redirect(
    new URL("/settings?connected=true", request.url)
  );
}

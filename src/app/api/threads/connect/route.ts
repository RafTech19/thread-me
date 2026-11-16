import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const appId = process.env.THREADS_APP_ID;
  const redirectUri = process.env.THREADS_REDIRECT_URI || "http://localhost:3000/api/threads/callback";

  // State acak untuk proteksi CSRF
  const state = crypto.randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("threads_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 menit
    path: "/",
  });

  // Jika di mode development dengan ID dummy, redirect langsung ke callback dengan code simulasi
  if (!appId || appId.includes("dummy")) {
    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set("code", "demo_mock_threads_auth_code_123");
    callbackUrl.searchParams.set("state", state);
    return NextResponse.redirect(callbackUrl);
  }

  // URL Otorisasi resmi Meta Threads
  const scopes = [
    "threads_basic",
    "threads_content_publish",
    "threads_manage_insights",
    "threads_read_replies",
  ].join(",");

  const authUrl = `https://threads.net/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scopes}&response_type=code&state=${state}`;

  return NextResponse.redirect(authUrl);
}


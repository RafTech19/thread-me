import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rute Publik yang bebas diakses
  const publicPaths = [
    "/",
    "/login",
    "/privacy",
    "/terms",
    "/api/auth",
    "/api/cron",
    "/api/threads",
    "/_next",
    "/favicon.ico",
  ];

  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Cek token sesi Auth.js (NextAuth)
  const sessionToken =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value;

  // Jika di production atau token tidak ada (dan bukan bypass lokal), redirect ke login
  const isDummyAuthConfigured =
    !process.env.AUTH_GOOGLE_ID ||
    process.env.AUTH_GOOGLE_ID.includes("dummy");

  if (!sessionToken && !isDummyAuthConfigured) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/generator/:path*",
    "/queue/:path*",
    "/posts/:path*",
    "/automation/:path*",
    "/ai-usage/:path*",
    "/notifications/:path*",
    "/settings/:path*",
  ],
};

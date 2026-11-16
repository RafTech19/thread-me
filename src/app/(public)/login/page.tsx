"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { signIn } from "next-auth/react";
import { AppLogo } from "@/components/common/app-logo";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const isAccessDenied = error === "AccessDenied";
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error("Gagal melakukan login Google:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center p-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex items-center justify-center">
            <AppLogo size="xl" showText={false} />
          </div>
          <CardTitle className="mt-4 font-heading text-2xl font-bold">
            Masuk ke ThreadMe
          </CardTitle>
          <CardDescription className="text-sm">
            Ruang kerja pribadi Meta Threads @kaitodex.19
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* Access Denied Warning Alert */}
          {isAccessDenied && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-destructive">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold">Akses Ditolak</p>
                <p className="text-destructive/90 leading-relaxed">
                  Akun email ini bukan pemilik resmi aplikasi. Akses dibatasi khusus
                  untuk akun <strong>rafli.bim05@gmail.com</strong>.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary shrink-0" />
            <span>
              Login dibatasi khusus untuk email owner: <strong>rafli.bim05@gmail.com</strong>
            </span>
          </div>

          {/* Google OAuth Button */}
          <Button
            type="button"
            className="w-full h-11 gap-3 font-semibold text-sm shadow-sm"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>{isLoading ? "Menghubungkan ke Google..." : "Masuk dengan Google"}</span>
            {!isLoading && <ArrowRight className="h-4 w-4 ml-auto" />}
          </Button>

          {/* Helper toggle for testing the AccessDenied error screen */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                if (isAccessDenied) {
                  router.push("/login");
                } else {
                  router.push("/login?error=AccessDenied");
                }
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground underline"
            >
              {isAccessDenied
                ? "Sembunyikan simulasi error"
                : "Uji tampilan pesan error (AccessDenied)"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-muted-foreground">
          Memuat halaman login...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

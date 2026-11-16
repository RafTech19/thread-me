import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AppLogo } from "@/components/common/app-logo";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Public Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center">
            <AppLogo size="md" />
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button size="sm" className="font-medium">
                Masuk
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Public Content */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left sm:px-6">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 ThreadMe. Hak cipta dilindungi undang-undang.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground hover:underline">
              Kebijakan Privasi
            </Link>
            <Link href="/terms" className="hover:text-foreground hover:underline">
              Syarat Layanan
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


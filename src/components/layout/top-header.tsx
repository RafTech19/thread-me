"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./theme-toggle";
import { NotificationPopover } from "./notification-popover";
import { Sidebar } from "./sidebar";

export function TopHeader() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger button */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground md:hidden hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Quick Search */}
          <div className="relative hidden w-64 md:block lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari postingan, topik, atau metrik..."
              className="h-9 pl-9 text-xs rounded-lg bg-muted/40 border-border"
            />
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <NotificationPopover />

          {/* User profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                KD
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold leading-none text-foreground">
                  Kaito deluxe
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Owner
                </p>
              </div>
            </button>

            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-border/80">
                    <p className="text-xs font-bold text-foreground">
                      Kaito deluxe
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      rafli.bim05@gmail.com
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Pengaturan
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <User className="h-3.5 w-3.5" />
                      Profil & Akun
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-border/80">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Keluar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex w-72 flex-col bg-card shadow-2xl">
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

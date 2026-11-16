"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  FileText,
  Clock,
  Cpu,
  Bell,
  Settings,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { AppLogo } from "@/components/common/app-logo";
import { getRealtimeAIUsageAction } from "@/actions/ai-usage";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generator", label: "Thread Generator", icon: Sparkles },
  { href: "/queue", label: "Antrian Kalender", icon: CalendarDays },
  { href: "/posts", label: "Semua Postingan", icon: FileText },
  { href: "/automation", label: "Jadwal Otomatis", icon: Clock },
  { href: "/ai-usage", label: "AI Usage", icon: Cpu },
  { href: "/notifications", label: "Notifikasi", icon: Bell },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [usageData, setUsageData] = useState<{
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
  }>({
    used: 0,
    limit: 50,
    remaining: 50,
    percentage: 0,
  });

  // Ambil data kuota realtime saat load & per pergantian rute
  useEffect(() => {
    let isMounted = true;
    async function fetchQuota() {
      try {
        const res = await getRealtimeAIUsageAction();
        if (res && isMounted) {
          const used = res.totalRequestsToday || 0;
          const limit = res.dailyLimit || 50;
          const remaining = Math.max(0, limit - used);
          const percentage = Math.min(100, Math.round((used / limit) * 100));
          setUsageData({ used, limit, remaining, percentage });
        }
      } catch (err) {
        console.warn("Gagal mengambil realtime quota di sidebar:", err);
      }
    }

    fetchQuota();
    // Polling periodik tiap 20 detik agar selalu realtime
    const interval = setInterval(fetchQuota, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pathname]);

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col justify-between border-r border-border bg-card p-4 transition-all duration-300",
        className
      )}
    >
      <div>
        {/* Brand Header */}
        <div className="px-2 py-1">
          <AppLogo size="md" subtitle="Threads AI Workspace" />
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-soft text-primary font-semibold dark:bg-primary/20 dark:text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Global Status Cards at Bottom */}
      <div className="space-y-3 pt-4 border-t border-border">
        {/* Threads Connection Card */}
        <Link
          href="/settings"
          onClick={onNavigate}
          className="group block rounded-xl border border-border/80 bg-muted/40 p-3 transition-colors hover:border-primary/40 hover:bg-muted/70"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
              Akun Threads
              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Aktif
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground truncate font-medium">
            @kaitodex.19
          </p>
        </Link>

        {/* AI Quota Card (Realtime & Clickable to /ai-usage) */}
        <Link
          href="/ai-usage"
          onClick={onNavigate}
          className="group block rounded-xl border border-border/80 bg-muted/40 p-3 transition-colors hover:border-primary/40 hover:bg-muted/70"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
              Kuota AI Hari Ini
              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="tabular-nums font-medium text-muted-foreground">
              {usageData.used}/{usageData.limit}
            </span>
          </div>
          <div className="mt-2">
            <Progress value={usageData.percentage} max={100} className="h-1.5" />
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Tersisa {usageData.remaining} request (reset 00.00 WIB)
          </p>
        </Link>
      </div>
    </aside>
  );
}

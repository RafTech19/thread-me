import React from "react";
import { cn } from "@/lib/utils";

export type PostStatusType =
  | "draft"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed"
  | "cancelled";

interface StatusBadgeProps {
  status: PostStatusType;
  className?: string;
  showDot?: boolean;
}

const statusConfig: Record<
  PostStatusType,
  { label: string; badgeClass: string; dotClass: string }
> = {
  draft: {
    label: "Draft",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    dotClass: "bg-slate-500",
  },
  scheduled: {
    label: "Terjadwal",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    dotClass: "bg-blue-500",
  },
  publishing: {
    label: "Memproses",
    badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    dotClass: "bg-purple-500 animate-pulse",
  },
  published: {
    label: "Terbit",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
  },
  failed: {
    label: "Gagal",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    dotClass: "bg-rose-500",
  },
  cancelled: {
    label: "Dibatalkan",
    badgeClass: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
    dotClass: "bg-zinc-400",
  },
};

export function StatusBadge({
  status,
  className,
  showDot = true,
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium select-none",
        config.badgeClass,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotClass)}
        />
      )}
      {config.label}
    </span>
  );
}


"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initialNotifications, InAppNotification } from "@/lib/mock-data";
import { formatDateIndo } from "@/lib/utils";

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>(
    initialNotifications
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Buka notifikasi"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-xl border border-border bg-card p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-semibold">
                  Notifikasi
                </span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Check className="h-3 w-3" />
                  Tandai dibaca
                </button>
              )}
            </div>

            <div className="mt-2 divide-y divide-border/60 max-h-80 overflow-y-auto">
              {notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className={`py-2.5 px-1.5 transition-colors rounded-lg hover:bg-muted/50 ${
                    !n.isRead ? "bg-primary-soft/40" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground">
                      {n.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDateIndo(n.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {n.message}
                  </p>
                  {n.linkUrl && (
                    <Link
                      href={n.linkUrl}
                      onClick={() => setIsOpen(false)}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                    >
                      Buka detail <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t border-border text-center">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Lihat semua notifikasi
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


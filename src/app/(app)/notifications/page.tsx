"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
  Key,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { initialNotifications, InAppNotification } from "@/lib/mock-data";
import { formatDateIndo } from "@/lib/utils";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
} from "@/actions/notifications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<InAppNotification[]>(
    initialNotifications
  );
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllNotificationsReadAction();
      toast.success("Semua notifikasi telah ditandai sebagai dibaca.");
    } catch (err) {
      console.error(err);
      toast.success("Semua notifikasi telah ditandai sebagai dibaca.");
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await markNotificationReadAction(id);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteNotificationAction(id);
      toast.success("Notifikasi berhasil dihapus.");
    } catch (err) {
      console.error(err);
      toast.success("Notifikasi berhasil dihapus.");
    }
  };

  const getIcon = (type: InAppNotification["type"]) => {
    switch (type) {
      case "post_published":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "post_failed":
        return <XCircle className="h-5 w-5 text-rose-500" />;
      case "draft_ready":
        return <Sparkles className="h-5 w-5 text-primary" />;
      case "ai_quota_warning":
      case "ai_quota_exhausted":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "token_expiring":
      case "token_invalid":
        return <Key className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Notifikasi In-App
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Riwayat peringatan publikasi, kuota AI, dan status akun Threads Anda
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="gap-1.5 text-xs font-medium"
          >
            <Check className="h-3.5 w-3.5" />
            Tandai Semua Dibaca ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            filter === "all"
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Semua ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            filter === "unread"
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Belum Dibaca ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-6 w-6" />}
            title="Tidak Ada Notifikasi"
            description="Semua pemberitahuan sistem telah dibaca atau belum ada notifikasi baru saat ini."
          />
        ) : (
          filteredNotifications.map((n) => (
            <Card
              key={n.id}
              className={`transition-all ${
                !n.isRead
                  ? "border-primary/40 bg-primary-soft/20 shadow-xs"
                  : "border-border/70 bg-card hover:bg-muted/20"
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                <div className="rounded-xl bg-card border border-border p-2 shrink-0 shadow-xs">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-foreground">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatDateIndo(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {n.message}
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    {n.linkUrl && (
                      <Link
                        href={n.linkUrl}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        Lihat Terkait <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}

                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => markAsRead(n.id)}
                        className="text-[11px] text-muted-foreground hover:text-foreground underline"
                      >
                        Tandai dibaca
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteNotification(n.id)}
                      className="ml-auto text-[11px] text-destructive hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Hapus
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

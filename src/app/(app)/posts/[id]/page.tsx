"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  RefreshCw,
  XCircle,
  Copy,
  Heart,
  MessageCircle,
  AlertTriangle,
  Send,
  Layers,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge, PostStatusType } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { reschedulePostAction, cancelPostAction } from "@/actions/posts";
import { formatDateIndo, formatNumber } from "@/lib/utils";

interface PostItemData {
  id: string;
  position: number;
  content: string;
  threadsMediaId?: string | null;
  status: string;
}

interface PostMetricData {
  likes: number;
  replies: number;
  views?: number | null;
  reposts?: number | null;
}

interface PostDetailData {
  id: string;
  topic?: string | null;
  type: "single" | "thread";
  source: string;
  status: PostStatusType;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  threadsMediaId?: string | null;
  permalink?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  items: PostItemData[];
  metrics?: PostMetricData[] | PostMetricData;
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [post, setPost] = useState<PostDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState("2026-11-17");
  const [newTime, setNewTime] = useState("11:00");
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchPostDetail() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) {
          throw new Error("Postingan tidak ditemukan di database.");
        }
        const data = await res.json();
        if (isMounted) {
          setPost(data.post);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setErrorMessage(err instanceof Error ? err.message : "Gagal memuat detail postingan.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    fetchPostDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCopyAll = () => {
    if (!post || !post.items || post.items.length === 0) return;
    const fullText = post.items
      .map((item, idx) => `[${idx + 1}/${post.items.length}]\n${item.content}`)
      .join("\n\n");
    navigator.clipboard.writeText(fullText);
    toast.success("Seluruh bagian thread berhasil disalin!");
  };

  const handleRetryPublish = () => {
    setIsRetrying(true);
    toast.info("Mencoba mempublikasikan ulang ke Threads...");
    setTimeout(() => {
      setIsRetrying(false);
      toast.success("Percobaan publikasi ulang berhasil terkirim!");
    }, 1500);
  };

  const handleCancelPost = async () => {
    if (!post) return;
    try {
      await cancelPostAction(post.id);
      toast.info("Postingan telah dibatalkan.");
      router.push("/posts");
    } catch {
      toast.error("Gagal membatalkan postingan.");
    }
  };

  const handleConfirmReschedule = async () => {
    if (!post) return;
    try {
      const targetIso = new Date(`${newDate}T${newTime}:00+07:00`).toISOString();
      await reschedulePostAction(post.id, targetIso);
      setRescheduleOpen(false);
      toast.success(
        `Jadwal postingan berhasil diperbarui ke ${newDate} pukul ${newTime} WIB.`
      );
      setPost((prev) =>
        prev
          ? {
              ...prev,
              scheduledAt: targetIso,
              status: "scheduled",
            }
          : prev
      );
    } catch {
      toast.error("Gagal memperbarui jadwal postingan.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Memuat detail postingan Threads...</p>
      </div>
    );
  }

  if (errorMessage || !post) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="rounded-full bg-muted h-12 w-12 flex items-center justify-center mx-auto text-muted-foreground">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Postingan Tidak Ditemukan</h2>
          <p className="text-xs text-muted-foreground">
            {errorMessage || "Data postingan ini tidak ada di database."}
          </p>
        </div>
        <Link href="/posts">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Semua Postingan
          </Button>
        </Link>
      </div>
    );
  }

  const currentMetrics = Array.isArray(post.metrics) ? post.metrics[0] : post.metrics;
  const items = post.items || [];
  const displayTopic =
    post.topic ||
    (items[0]?.content
      ? items[0].content.slice(0, 70) + (items[0].content.length > 70 ? "..." : "")
      : "Utas Threads");

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Back button & Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/posts">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl line-clamp-1">
                {displayTopic}
              </h1>
              <StatusBadge status={post.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              ID Postingan: {post.id} &bull; Dibuat {formatDateIndo(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            className="text-xs gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" />
            Salin Teks
          </Button>

          {post.status === "failed" && (
            <Button
              size="sm"
              onClick={handleRetryPublish}
              disabled={isRetrying}
              className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`}
              />
              Coba Lagi
            </Button>
          )}

          {(post.status === "scheduled" || post.status === "draft") && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRescheduleOpen(true)}
                className="text-xs gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5" />
                Jadwalkan Ulang
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelPost}
                className="text-xs text-destructive hover:bg-destructive/10 gap-1.5"
              >
                <XCircle className="h-3.5 w-3.5" />
                Batalkan
              </Button>
            </>
          )}

          {post.permalink && (
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-muted"
            >
              Buka di Threads
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Error alert if failed */}
      {post.status === "failed" && post.errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Gagal Dipublikasikan ke Threads</h4>
            <p className="text-xs text-destructive/90 leading-relaxed">
              {post.errorMessage}
            </p>
            <p className="text-[11px] text-destructive/80 pt-1">
              Sistem telah melakukan 3 kali percobaan otomatis. Silakan verifikasi koneksi akun di menu Pengaturan lalu tekan tombol &quot;Coba Lagi&quot;.
            </p>
          </div>
        </div>
      )}

      {/* Published Metrics Summary Bar */}
      {post.status === "published" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">Likes</p>
                <p className="font-heading text-xl font-bold tabular-nums text-foreground mt-0.5">
                  {formatNumber(currentMetrics?.likes || 0)}
                </p>
              </div>
              <Heart className="h-6 w-6 text-rose-500 opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-sky-50/50 dark:bg-sky-950/20 border-sky-200/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-sky-700 dark:text-sky-400 font-medium">Balasan</p>
                <p className="font-heading text-xl font-bold tabular-nums text-foreground mt-0.5">
                  {formatNumber(currentMetrics?.replies || 0)}
                </p>
              </div>
              <MessageCircle className="h-6 w-6 text-sky-500 opacity-80" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Tayangan (Views)</p>
                <p className="font-heading text-xl font-bold tabular-nums text-foreground mt-0.5">
                  {formatNumber(currentMetrics?.views || 0)}
                </p>
              </div>
              <Layers className="h-6 w-6 text-muted-foreground opacity-60" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Reposts</p>
                <p className="font-heading text-xl font-bold tabular-nums text-foreground mt-0.5">
                  {formatNumber(currentMetrics?.reposts || 0)}
                </p>
              </div>
              <Send className="h-6 w-6 text-muted-foreground opacity-60" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Thread Parts Cards List */}
      <div className="space-y-4">
        <h2 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
          Rangkaian Postingan ({items.length} Post)
        </h2>

        {items.map((item, index) => (
          <Card key={item.id || index} className="relative">
            <CardHeader className="pb-2 pt-4 px-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">
                  {index + 1}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  Post {index + 1} dari {items.length}
                </span>
                {item.threadsMediaId && (
                  <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    Media ID: {item.threadsMediaId}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {(item.content || "").length} / 500 karakter
              </span>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="rounded-lg bg-muted/30 p-3.5 text-sm leading-relaxed whitespace-pre-line border border-border/60">
                {item.content}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reschedule Dialog Modal */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jadwalkan Ulang Postingan</DialogTitle>
            <DialogDescription>
              Pilih tanggal dan jam baru untuk penerbitan ke Threads.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Tanggal Baru
              </label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">
                Jam Baru (WIB)
              </label>
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRescheduleOpen(false)}
            >
              Batal
            </Button>
            <Button size="sm" onClick={handleConfirmReschedule}>
              Simpan Jadwal Baru
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

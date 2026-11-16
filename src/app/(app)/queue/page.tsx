"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Zap,
  Sparkles,
  Layers,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge, PostStatusType } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Post } from "@/lib/mock-data";
import { formatDateIndo } from "@/lib/utils";
import { getPostsAction, createPostAction } from "@/actions/posts";

// Calendar Days of Week in Indonesian
const DAYS_OF_WEEK = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function QueuePage() {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [currentMonth, setCurrentMonth] = useState("November 2026");
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPostsAction();
        setPosts(data || []);
      } catch (err) {
        console.error("Gagal load queue posts:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Add post dialog modal
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newDate, setNewDate] = useState("2026-11-16");
  const [newTime, setNewTime] = useState("10:00");

  // Selected post for quick preview modal
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleCreateScheduledPost = () => {
    if (!newTopic.trim()) {
      toast.error("Topik postingan wajib diisi.");
      return;
    }

    const newPost: Post = {
      id: `post-${Date.now()}`,
      type: "single",
      source: "manual",
      topic: newTopic,
      status: "scheduled",
      scheduledAt: `${newDate}T${newTime}:00Z`,
      retryCount: 0,
      aiGenerated: false,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: `item-${Date.now()}`,
          postId: `post-${Date.now()}`,
          position: 1,
          content: `${newTopic}. Jangan lupa prioritaskan hal penting terlebih dahulu hari ini.`,
          status: "scheduled",
        },
      ],
    };

    setPosts((prev) => [...prev, newPost]);
    setAddDialogOpen(false);
    setNewTopic("");
    toast.success(
      `Postingan "${newTopic}" berhasil ditambahkan ke antrian kalender!`
    );
  };

  // Konversi tanggal ke angka hari sesuai zona waktu Indonesia (WIB / GMT+7)
  const getWIBDay = (dateInput: string | Date | null | undefined): number | null => {
    if (!dateInput) return null;
    try {
      const d = new Date(dateInput);
      const str = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Jakarta",
        day: "numeric",
      }).format(d);
      return parseInt(str, 10);
    } catch {
      return null;
    }
  };

  // Hari ini di WIB
  const todayWIBDay = (() => {
    try {
      const now = new Date();
      const str = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Jakarta",
        day: "numeric",
      }).format(now);
      return parseInt(str, 10);
    } catch {
      return 13;
    }
  })();

  // Kalender November 2026:
  // 1 November 2026 adalah hari Minggu (0).
  // Dengan urutan kolom Sen(0), Sel(1), Rab(2), Kam(3), Jum(4), Sab(5), Min(6),
  // maka tanggal 1 jatuh di kolom Min (kolom ke-7), membutuhkan 6 sel padding kosong di awal.
  const paddingBefore = 6;
  const paddingCells: (number | null)[] = Array.from({ length: paddingBefore }, () => null);
  const calendarDays: number[] = Array.from({ length: 30 }, (_, i) => i + 1);
  const fullCalendarGrid: (number | null)[] = [...paddingCells, ...calendarDays];

  const getPostsForDay = (day: number) => {
    return posts.filter((p) => {
      const targetDate = p.scheduledAt || p.publishedAt || p.createdAt;
      return getWIBDay(targetDate) === day;
    });
  };

  const upcomingQueue = posts
    .filter((p) => p.status === "scheduled")
    .sort(
      (a, b) =>
        new Date(a.scheduledAt || "").getTime() -
        new Date(b.scheduledAt || "").getTime()
    );

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Antrian Konten & Kalender
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualisasikan dan atur jadwal penayangan postingan Threads Anda
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month / Week Switcher */}
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bulan
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Minggu
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setAddDialogOpen(true)}
            className="gap-1.5 text-xs font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Tambah Postingan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Calendar View (Col 8) */}
        <Card className="lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                {currentMonth}
              </CardTitle>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => toast.info("Bulan sebelumnya")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => toast.info("Bulan berikutnya")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-2 sm:p-4">
            {/* Days header */}
            <div className="grid grid-cols-7 gap-1 text-center font-heading text-xs font-semibold text-muted-foreground pb-2 border-b border-border">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1.5 pt-2">
              {fullCalendarGrid.map((day, idx) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[90px] rounded-lg border border-dashed border-border/20 bg-muted/10 opacity-40"
                    />
                  );
                }

                const dayPosts = getPostsForDay(day);
                const isToday = day === todayWIBDay;

                return (
                  <div
                    key={`day-${day}`}
                    onClick={() => {
                      if (dayPosts.length === 0) {
                        setNewDate(`2026-11-${String(day).padStart(2, "0")}`);
                        setAddDialogOpen(true);
                      }
                    }}
                    className={`min-h-[90px] rounded-lg border p-1.5 transition-all cursor-pointer hover:border-primary/50 ${
                      isToday
                        ? "border-primary bg-primary-soft/30 dark:bg-primary/15 ring-2 ring-primary/20"
                        : "border-border/60 bg-card hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                          isToday
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-foreground"
                        }`}
                      >
                        {day}
                      </span>
                      {dayPosts.length > 0 && (
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {dayPosts.length} post
                        </span>
                      )}
                    </div>

                    {/* Post Chips inside day cell */}
                    <div className="mt-1 space-y-1">
                      {dayPosts.map((p) => (
                        <div
                          key={p.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPost(p);
                          }}
                          className={`group flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium truncate transition-colors shadow-xs ${
                            p.status === "published"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                              : p.status === "scheduled"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300"
                          }`}
                        >
                          {p.source === "automation" && (
                            <Zap className="h-2.5 w-2.5 shrink-0 text-amber-500" />
                          )}
                          {p.type === "thread" && (
                            <Layers className="h-2.5 w-2.5 shrink-0" />
                          )}
                          <span className="truncate">{p.topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span>Terjadwal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Sudah Terbit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>Gagal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-amber-500" />
                <span>Dari Jadwal Otomatis</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Queue List (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span>Daftar Antrian</span>
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                  {upcomingQueue.length} Terjadwal
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Urutan postingan yang siap diunggah otomatis oleh cron
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {upcomingQueue.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  Tidak ada postingan dalam antrian saat ini.
                </div>
              ) : (
                upcomingQueue.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPost(item)}
                    className="cursor-pointer rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2 transition-all hover:bg-muted/50 hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {item.source === "automation" && (
                          <span
                            title="Postingan dihasilkan otomatis oleh Jadwal Otomatis"
                            className="rounded bg-amber-100 dark:bg-amber-950/60 p-0.5 text-amber-600 dark:text-amber-400"
                          >
                            <Zap className="h-3 w-3" />
                          </span>
                        )}
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                          {item.type === "thread"
                            ? `Thread (${item.items.length})`
                            : "Tunggal"}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.scheduledAt ? formatDateIndo(item.scheduledAt) : "-"}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-foreground line-clamp-1">
                      {item.topic}
                    </p>

                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {item.items[0]?.content}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Post Detail Preview Modal */}
      {selectedPost && (
        <Dialog
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <StatusBadge status={selectedPost.status} />
                <span className="text-xs text-muted-foreground">
                  {selectedPost.type === "thread"
                    ? `Thread (${selectedPost.items.length} Post)`
                    : "Post Tunggal"}
                </span>
              </div>
              <DialogTitle className="mt-2 text-base font-bold">
                {selectedPost.topic}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedPost.scheduledAt
                  ? `Jadwal rilis: ${formatDateIndo(selectedPost.scheduledAt)}`
                  : `Dibuat: ${formatDateIndo(selectedPost.createdAt)}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 max-h-60 overflow-y-auto">
              {selectedPost.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-lg bg-muted/40 p-3 text-xs leading-relaxed border border-border/70"
                >
                  <p className="font-semibold text-muted-foreground text-[10px] mb-1">
                    Bagian {idx + 1}
                  </p>
                  {item.content}
                </div>
              ))}
            </div>

            <DialogFooter>
              <Link href={`/posts/${selectedPost.id}`}>
                <Button size="sm" className="w-full text-xs">
                  Buka Halaman Detail Penuh
                </Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add New Scheduled Post Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Postingan ke Antrian</DialogTitle>
            <DialogDescription>
              Tuliskan topik konten dan tentukan tanggal serta jam penayangan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Topik Postingan
              </label>
              <Input
                placeholder="Contoh: 3 mindset penting programmer pemula"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Tanggal
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
                  Jam (WIB)
                </label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary shrink-0" />
              <span>
                Konten otomatis disesuaikan dengan Brand Voice dan batas 500 karakter per post.
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddDialogOpen(false)}
            >
              Batal
            </Button>
            <Button size="sm" onClick={handleCreateScheduledPost}>
              Simpan ke Antrian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


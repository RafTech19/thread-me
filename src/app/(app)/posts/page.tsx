"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ExternalLink,
  Layers,
  Sparkles,
  Bot,
  User,
  Copy,
  Trash2,
  Calendar,
  Heart,
  MessageCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge, PostStatusType } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { deletePostAction } from "@/actions/posts";
import { formatDateIndo } from "@/lib/utils";

const statusFilterOptions: { value: string; label: string }[] = [
  { value: "all", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Terjadwal" },
  { value: "published", label: "Terbit" },
  { value: "failed", label: "Gagal" },
];

export default function PostsPage() {
  const [postsList, setPostsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [postToDelete, setPostToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPostsList(data.posts || []);
      }
    } catch (err) {
      console.error("Gagal load initial posts:", err);
    } finally {
      setIsLoading(false);
    }

    // Auto-sync live metrik di background
    try {
      const syncRes = await fetch("/api/posts/sync", { method: "POST" });
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        if (syncData.success && syncData.posts) {
          setPostsList(syncData.posts);
        }
      }
    } catch (e) {
      // Background silent fallback
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filteredPosts = postsList.filter((p) => {
    const matchesStatus =
      statusFilter === "all" ? true : p.status === statusFilter;
    const matchesSearch =
      (p.topic || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.items || []).some((i: any) =>
        (i.content || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Konten postingan berhasil disalin ke clipboard!");
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deletePostAction(postToDelete.id);
      setPostsList((prev) => prev.filter((p) => p.id !== postToDelete.id));
      if (res?.deletedFromThreads) {
        toast.success("Postingan berhasil dihapus dari akun Threads (@kaitodex.19) dan ThreadMe.");
      } else if (res?.threadsError) {
        toast.warning(`Postingan dihapus dari database ThreadMe. Info Meta: ${res.threadsError}`);
      } else {
        toast.success("Postingan berhasil dihapus.");
      }
      setPostToDelete(null);
    } catch {
      toast.error("Gagal menghapus postingan.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Semua Postingan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola draft, postingan terjadwal, dan riwayat penerbitan ke Threads
          </p>
        </div>

        <Link href="/generator">
          <Button size="sm" className="gap-1.5 text-xs font-semibold shadow-sm">
            <Plus className="h-4 w-4" />
            Buat Postingan Baru
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari topik atau isi teks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {statusFilterOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === opt.value
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          {filteredPosts.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Search className="h-6 w-6" />}
                title="Tidak Ada Postingan Ditemukan"
                description="Coba ubah kata kunci pencarian atau sesuaikan filter status postingan Anda."
                actionLabel="Reset Filter"
                onAction={() => {
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%]">Konten & Topik</TableHead>
                  <TableHead>Format & Sumber</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    {/* Content & Topic */}
                    <TableCell className="align-top">
                      <div className="space-y-1">
                        <Link
                          href={`/posts/${post.id}`}
                          className="font-semibold text-xs text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {post.topic}
                        </Link>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {post.items[0]?.content}
                        </p>
                        {post.errorMessage && (
                          <p className="text-[10px] text-destructive font-medium line-clamp-1">
                            Error: {post.errorMessage}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Format & Source */}
                    <TableCell className="align-top space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium">
                          {post.type === "thread" ? (
                            <span className="flex items-center gap-1">
                              <Layers className="h-3 w-3" />
                              Thread ({post.items.length})
                            </span>
                          ) : (
                            "Tunggal"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        {post.source === "generator" ? (
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5 text-primary" /> Gemini
                          </span>
                        ) : post.source === "automation" ? (
                          <span className="flex items-center gap-1">
                            <Bot className="h-2.5 w-2.5 text-sky-600" /> Otomatis
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <User className="h-2.5 w-2.5" /> Manual
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Status Badge & Engagement */}
                    <TableCell className="align-top">
                      <div className="space-y-1">
                        <StatusBadge status={post.status} />
                        {post.status === "published" && (
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
                            <span className="flex items-center gap-1 font-semibold text-foreground" title="Jumlah Suka (Likes)">
                              <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
                              {post.metrics?.[0]?.likes ?? post.metrics?.likes ?? 0}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-foreground" title="Jumlah Balasan (Replies)">
                              <MessageCircle className="h-3 w-3 text-sky-500" />
                              {post.metrics?.[0]?.replies ?? post.metrics?.replies ?? 0}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Timestamps */}
                    <TableCell className="align-top text-xs text-muted-foreground">
                      {post.publishedAt ? (
                        <div>
                          <p className="text-[10px] text-emerald-600 font-semibold">
                            Terbit
                          </p>
                          <p className="text-[11px] font-medium text-foreground">
                            {formatDateIndo(post.publishedAt)}
                          </p>
                        </div>
                      ) : post.scheduledAt ? (
                        <div>
                          <p className="text-[10px] text-sky-600 font-semibold">
                            Terjadwal
                          </p>
                          <p className="text-[11px] font-medium text-foreground">
                            {formatDateIndo(post.scheduledAt)}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[10px] text-muted-foreground font-semibold">
                            Draft Dibuat
                          </p>
                          <p className="text-[11px] font-medium text-foreground">
                            {formatDateIndo(post.createdAt)}
                          </p>
                        </div>
                      )}
                    </TableCell>

                    {/* Quick Actions */}
                    <TableCell className="align-top text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Salin isi postingan"
                          onClick={() => handleCopy(post.items[0]?.content || "")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Hapus postingan"
                          onClick={() => setPostToDelete(post)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>

                        <Link href={`/posts/${post.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1"
                          >
                            Detail
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmation & Warning Dialog Before Deleting Post */}
      <Dialog
        open={!!postToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setPostToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Hapus Postingan dari Threads?
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Konfirmasi penghapusan permanen konten
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {postToDelete?.status === "published" || postToDelete?.threadsMediaId ? (
              <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Peringatan: Postingan Akan Terhapus dari Akun Threads!
                </p>
                <p className="text-destructive/90 leading-relaxed text-[11px]">
                  Postingan ini sudah terbit di akun resmi Threads <strong>@kaitodex.19</strong>. Menghapusnya di sini akan <strong>secara otomatis menghapus postingan tersebut langsung dari akun Threads Anda</strong> secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-border bg-muted/40 text-muted-foreground">
                <p className="text-[11px] leading-relaxed">
                  Postingan berstatus <strong>{postToDelete?.status}</strong> ini akan dihapus secara permanen dari sistem ThreadMe.
                </p>
              </div>
            )}

            <div className="p-3 rounded-xl border border-border bg-card space-y-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Topik / Isi Postingan:
              </span>
              <p className="font-medium text-foreground text-xs line-clamp-3">
                {postToDelete?.topic || postToDelete?.items?.[0]?.content}
              </p>
              {postToDelete?.publishedAt && (
                <p className="text-[10px] text-muted-foreground font-mono">
                  Waktu Terbit: {formatDateIndo(postToDelete.publishedAt)}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPostToDelete(null)}
              disabled={isDeleting}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="gap-1.5 text-xs font-semibold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menghapus dari Threads...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Ya, Hapus Sekarang
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


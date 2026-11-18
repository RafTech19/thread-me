"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Eye,
  UserCheck,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Clock,
  MapPin,
  Globe2,
  Send,
  Flame,
  CheckCircle2,
  Heart,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { threadsOfficialAnalyticsData } from "@/lib/threads/analytics-data";
import { ThreadsSparkline } from "@/components/dashboard/threads-sparkline";
// Posts loaded via /api/posts and /api/posts/sync routes (more reliable than server actions in client components)
import { formatDateIndo } from "@/lib/utils";

export default function DashboardPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [realPosts, setRealPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [liveSummary, setLiveSummary] = useState<{
    views: number;
    viewers: number;
    followers: number;
    likes: number;
    replies: number;
    interactions: number;
    totalPosts: number;
  } | null>(null);

  const data = threadsOfficialAnalyticsData;

  useEffect(() => {
    async function loadAndAutoSync() {
      // 1. Tampilkan data dari database secara instan
      try {
        const res = await fetch("/api/posts");
        if (res.ok) {
          const data = await res.json();
          setRealPosts(data.posts || []);
          if (data.summary) {
            setLiveSummary(data.summary);
          }
        }
      } catch (err) {
        console.error("Gagal load initial posts:", err);
      } finally {
        setIsLoadingPosts(false);
      }

      // 2. Sinkronkan secara otomatis dengan Meta Threads API di latar belakang
      try {
        const syncRes = await fetch("/api/posts/sync", { method: "POST" });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData.success && syncData.posts) {
            setRealPosts(syncData.posts);
            if (syncData.summary) {
              setLiveSummary(syncData.summary);
            }
          }
        }
      } catch (syncErr) {
        // Abaikan jika offline / rate limited, data cache DB sudah terpasang
        console.warn("Background auto-sync info:", syncErr);
      }
    }

    loadAndAutoSync();
  }, []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    toast.info("Menyinkronkan daftar postingan & metrik dari Meta Threads API (@kaitodex.19)...");
    try {
      const res = await fetch("/api/posts/sync", { method: "POST" });
      const data = await res.json();
      if (data.success && data.posts) {
        setRealPosts(data.posts);
        if (data.summary) {
          setLiveSummary(data.summary);
        }
        toast.success(`Berhasil! ${data.synced} postingan live beserta likes & replies tersinkronisasi.`);
      } else {
        // Fallback: load from DB
        const fallback = await fetch("/api/posts");
        if (fallback.ok) {
          const fb = await fallback.json();
          setRealPosts(fb.posts || []);
          if (fb.summary) {
            setLiveSummary(fb.summary);
          }
        }
        toast.warning(`Sinkronisasi selesai${data.error ? `: ${data.error}` : ""}`);
      }
    } catch {
      toast.error("Gagal sinkronisasi data.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Profile & Live Status Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-5 rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 bg-muted">
            <img
              src="/profile.jpg"
              alt={data.profile.displayName}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = data.profile.avatarUrl;
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {data.profile.displayName}
              </h1>
              <span className="font-mono text-sm font-semibold text-primary">
                @{data.profile.username}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Akun Terhubung Resmi
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <span>Laporan Analitik Resmi Threads</span>
              <span>&bull;</span>
              <span className="font-medium text-foreground">{data.profile.periodLabel}</span>
              <span>&bull;</span>
              <span>Zona Waktu: {data.profile.timezone}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Menyinkronkan..." : "Sinkronkan Live"}
          </Button>

          <Button size="sm" asChild className="gap-2 text-xs font-semibold">
            <Link href="/generator">
              <Sparkles className="h-3.5 w-3.5" />
              Buat Thread Baru
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Summary Cards (Views, Viewers, Net Followers, Interactions) with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Views */}
        <Card className="overflow-hidden border-border/80">
          <CardHeader className="pb-1 pt-4 px-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tayangan (Views)
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +{data.summary.views.growthPercent}%
                <TrendingUp className="h-3 w-3" />
              </span>
            </div>
            <div className="text-3xl font-bold font-heading text-foreground mt-1">
              {liveSummary
                ? liveSummary.views.toLocaleString("id-ID")
                : data.summary.views.total.toLocaleString("id-ID")}
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-3 pt-2">
            <ThreadsSparkline data={data.summary.views.trend} color="#2563eb" height={50} />
            <p className="text-[11px] text-muted-foreground mt-1 text-right">30 hari terakhir</p>
          </CardContent>
        </Card>

        {/* Card 2: Viewers */}
        <Card className="overflow-hidden border-border/80">
          <CardHeader className="pb-1 pt-4 px-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pemirsa Unik (Viewers)
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +{data.summary.viewers.growthPercent}%
                <TrendingUp className="h-3 w-3" />
              </span>
            </div>
            <div className="text-3xl font-bold font-heading text-foreground mt-1">
              {liveSummary
                ? liveSummary.viewers.toLocaleString("id-ID")
                : data.summary.viewers.total.toLocaleString("id-ID")}
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-3 pt-2">
            <ThreadsSparkline data={data.summary.viewers.trend} color="#8b5cf6" height={50} />
            <p className="text-[11px] text-muted-foreground mt-1 text-right">30 hari terakhir</p>
          </CardContent>
        </Card>

        {/* Card 3: Net Followers */}
        <Card className="overflow-hidden border-border/80">
          <CardHeader className="pb-1 pt-4 px-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Pengikut (Followers)
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +{data.summary.netFollowers.growthPercent}%
                <TrendingUp className="h-3 w-3" />
              </span>
            </div>
            <div className="text-3xl font-bold font-heading text-foreground mt-1">
              {liveSummary ? liveSummary.followers : `+${data.summary.netFollowers.total}`}
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-3 pt-2">
            <ThreadsSparkline data={data.summary.netFollowers.trend} color="#10b981" height={50} />
            <p className="text-[11px] text-muted-foreground mt-1 text-right">30 hari terakhir</p>
          </CardContent>
        </Card>

        {/* Card 4: Interactions */}
        <Card className="overflow-hidden border-border/80">
          <CardHeader className="pb-1 pt-4 px-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Interaksi Total
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                {data.summary.interactions.growthPercent}%
              </span>
            </div>
            <div className="text-3xl font-bold font-heading text-foreground mt-1">
              {liveSummary
                ? liveSummary.interactions.toLocaleString("id-ID")
                : data.summary.interactions.total}
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-3 pt-2">
            <ThreadsSparkline data={data.summary.interactions.trend} color="#f59e0b" height={50} />
            <p className="text-[11px] text-muted-foreground mt-1 text-right">30 hari terakhir</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Audience Reach Breakdown & Demographics */}
        <div className="lg:col-span-7 space-y-6">
          {/* Audience Reach Card: Non-Followers vs Followers */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base font-semibold">
                    Jangkauan Audiens & Rasio Viral
                  </CardTitle>
                </div>
                <span className="rounded-full bg-primary-soft text-primary px-2.5 py-0.5 text-xs font-bold">
                  724 Pemirsa (+752%)
                </span>
              </div>
              <CardDescription className="text-xs">
                Perbandingan pemirsa yang sudah mengikuti akun Anda vs audiens baru dari algoritma Feed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              {/* Segmented Progress Bar */}
              <div className="space-y-2">
                <div className="h-4 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${data.audienceReach.nonFollowers.percentage}%` }}
                    className="bg-primary h-full transition-all duration-500"
                    title={`Non-followers: ${data.audienceReach.nonFollowers.percentage}%`}
                  />
                  <div
                    style={{ width: `${data.audienceReach.followers.percentage}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title={`Followers: ${data.audienceReach.followers.percentage}%`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl border border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
                        Bukan Pengikut (Non-followers)
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        +{data.audienceReach.nonFollowers.growthPercent}%
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-heading text-foreground">
                        {data.audienceReach.nonFollowers.count}
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        ({data.audienceReach.nonFollowers.percentage}%)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                        Pengikut (Followers)
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        +{data.audienceReach.followers.growthPercent}%
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-heading text-foreground">
                        {data.audienceReach.followers.count}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        ({data.audienceReach.followers.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Strategic Insight Note */}
              <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 text-xs text-foreground leading-relaxed flex items-start gap-2.5">
                <Flame className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  <strong className="font-semibold text-primary">Efek Viral Algoritma Kuat:</strong> 98.9% pemirsa Anda berasal dari audiens baru yang belum mem-follow Anda. Ini menandakan konten yang diterbitkan sangat disukai algoritma eksplorasi Threads.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demographics: Age Distribution & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Age Distribution Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  Rentang Usia Audiens
                </CardTitle>
                <CardDescription className="text-xs">
                  Mayoritas audiens berada di usia produktif 18-34 tahun
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-1">
                {data.demographics.ageDistribution.map((item) => (
                  <div key={item.range} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-foreground">{item.range} tahun</span>
                      <span className="font-mono text-muted-foreground">{item.percentage}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        style={{ width: `${item.percentage}%` }}
                        className={`h-full rounded-full ${
                          item.percentage > 30 ? "bg-primary" : "bg-primary/50"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Gender Breakdown Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Distribusi Gender
                </CardTitle>
                <CardDescription className="text-xs">
                  Keseimbangan audiens pria dan wanita merata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
                  {data.demographics.genderBreakdown.map((g) => (
                    <div
                      key={g.gender}
                      style={{ width: `${g.percentage}%`, backgroundColor: g.color }}
                      className="h-full"
                      title={`${g.gender}: ${g.percentage}%`}
                    />
                  ))}
                </div>

                <div className="space-y-2 pt-1">
                  {data.demographics.genderBreakdown.map((g) => (
                    <div
                      key={g.gender}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: g.color }}
                        />
                        <span className="font-medium text-foreground">{g.gender}</span>
                      </div>
                      <span className="font-mono font-bold text-foreground">
                        {g.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column (5 cols): Geography, Best Times & Communities */}
        <div className="lg:col-span-5 space-y-6">
          {/* Geography: Top Cities & Countries */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  Geografi Pemirsa Terbanyak
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Lokasi pemirsa utama didominasi wilayah metropolitan Indonesia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-2">
                  Top 5 Kota:
                </span>
                <div className="space-y-2">
                  {data.geography.topCities.map((city, idx) => (
                    <div key={city.name} className="flex items-center justify-between text-xs">
                      <span className="text-foreground flex items-center gap-1.5 font-medium">
                        <span className="text-[11px] font-bold text-muted-foreground w-4">
                          {idx + 1}.
                        </span>
                        {city.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            style={{ width: `${city.percentage * 3.5}%` }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                        <span className="font-mono font-bold text-foreground w-12 text-right">
                          {city.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <span className="text-xs font-semibold text-muted-foreground block mb-2">
                  Top Negara:
                </span>
                <div className="flex flex-wrap gap-2">
                  {data.geography.topCountries.map((c) => (
                    <span
                      key={c.name}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-muted/40 text-xs font-medium text-foreground"
                    >
                      <Globe2 className="h-3 w-3 text-muted-foreground" />
                      <span>{c.name}</span>
                      <span className="font-mono font-bold text-primary">{c.percentage}%</span>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Most Active Times (WIB) */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  Waktu Terbaik Posting (Most Active Times)
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Jam emas di mana audiens Anda paling aktif membuka Threads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-1">
              {data.mostActiveTimes.map((item) => (
                <div
                  key={item.day}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    item.isPeak
                      ? "border-primary/40 bg-primary-soft/60"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <span>{item.day}</span>
                      {item.isPeak && (
                        <span className="rounded bg-primary text-primary-foreground text-[10px] px-1.5 py-0.2 font-bold">
                          Paling Ramai
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {item.timeRange}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold font-heading text-foreground block">
                      {item.viewers}
                    </span>
                    <span className="text-[10px] text-muted-foreground">pemirsa aktif</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Interests & Communities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Top Topik & Komunitas
              </CardTitle>
              <CardDescription className="text-xs">
                Kategori konten yang paling banyak menarik interaksi di profil Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="flex flex-wrap gap-2">
                {data.topCommunities.map((item) => (
                  <span
                    key={item.name}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-semibold text-foreground shadow-2xs hover:border-primary/40 transition-colors"
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                    <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                      {item.count}
                    </span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Real Published Posts List (From Neon DB) */}
      <Card>
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" />
              Daftar Postingan Terbit Nyata (Database Neon)
            </CardTitle>
            <CardDescription className="text-xs">
              Postingan yang telah berhasil dipublikasikan secara langsung ke akun Threads @kaitodex.19
            </CardDescription>
          </div>

          <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs font-medium">
            <Link href="/posts">
              Lihat Semua Postingan
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="pt-1">
          {isLoadingPosts ? (
            <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
              Memuat postingan nyata dari database...
            </div>
          ) : realPosts.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Belum ada postingan yang diterbitkan. Silakan buat di menu Thread Generator!
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Topik & Isi Postingan</TableHead>
                    <TableHead className="text-xs font-semibold w-20 text-center">
                      <span className="flex items-center justify-center gap-1" title="Jumlah Suka (Likes)">
                        <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> Suka
                      </span>
                    </TableHead>
                    <TableHead className="text-xs font-semibold w-20 text-center">
                      <span className="flex items-center justify-center gap-1" title="Jumlah Balasan (Replies)">
                        <MessageCircle className="h-3 w-3 text-sky-500" /> Balasan
                      </span>
                    </TableHead>
                    <TableHead className="text-xs font-semibold w-24 text-center">
                      <span className="flex items-center justify-center gap-1" title="Jumlah Tayangan (Views)">
                        <Eye className="h-3 w-3 text-primary" /> Views
                      </span>
                    </TableHead>
                    <TableHead className="text-xs font-semibold w-24">Tipe</TableHead>
                    <TableHead className="text-xs font-semibold w-36">Waktu Terbit</TableHead>
                    <TableHead className="text-xs font-semibold w-28 text-right">Tautan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {realPosts.map((p) => {
                    const metrics = Array.isArray(p.metrics)
                      ? p.metrics[0]
                      : p.metrics;
                    const likesCount = metrics?.likes ?? 0;
                    const repliesCount = metrics?.replies ?? 0;
                    const viewsCount = metrics?.views ?? 0;

                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs font-medium text-foreground py-3 max-w-md">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-foreground line-clamp-1">{p.topic}</p>
                            {p.items && p.items.length > 0 && (
                              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                {p.items[0].content}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold text-center text-foreground">
                          {likesCount}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold text-center text-foreground">
                          {repliesCount}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-center text-muted-foreground">
                          {viewsCount > 0 ? viewsCount.toLocaleString("id-ID") : "-"}
                        </TableCell>
                        <TableCell className="text-xs capitalize text-muted-foreground">
                          {p.type === "thread" ? "Utas" : "Tunggal"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {p.publishedAt ? formatDateIndo(p.publishedAt) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {p.permalink ? (
                            <a
                              href={p.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              Buka Post
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

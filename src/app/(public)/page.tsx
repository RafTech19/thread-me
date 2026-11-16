import React from "react";
import Link from "next/link";
import {
  Sparkles,
  CalendarDays,
  BarChart3,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full max-w-5xl px-4 pt-16 pb-20 text-center sm:px-6 lg:pt-24 lg:pb-28">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/60 px-3.5 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Otomatisasi Threads Pribadi dengan AI Gemini
        </div>

        <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
          Kelola & Jadwalkan Konten Threads Anda Tanpa Ribet
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground">
          ThreadMe adalah ruang kerja pribadi untuk merancang rangkaian thread,
          mengatur jadwal publikasi otomatis ke Meta Threads, dan memantau performa
          Likes serta Replies dalam satu tempat.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto gap-2 text-base font-semibold shadow-md">
              Mulai Sekarang dengan Google
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Lihat Preview Aplikasi
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            API Resmi Meta Threads
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-primary" />
            Akses Khusus Owner
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Terhubung Gemini Flash
          </div>
        </div>

        {/* Mockup Dashboard Preview Container */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-2xl sm:p-4">
          <div className="rounded-xl border border-border/80 bg-background/95 p-4 sm:p-6 text-left">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-mono text-muted-foreground">
                  threadme.local/dashboard
                </span>
              </div>
              <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                Preview Aktif
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground font-medium">Total Likes</p>
                <p className="mt-1 font-heading text-xl font-bold tabular-nums">1.214</p>
                <p className="mt-1 text-[11px] text-emerald-600 font-medium">+18.5% minggu ini</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground font-medium">Total Replies</p>
                <p className="mt-1 font-heading text-xl font-bold tabular-nums">170</p>
                <p className="mt-1 text-[11px] text-emerald-600 font-medium">+12.3% minggu ini</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground font-medium">Postingan Terbit</p>
                <p className="mt-1 font-heading text-xl font-bold tabular-nums">3 Post</p>
                <p className="mt-1 text-[11px] text-muted-foreground">100% terjadwal</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground font-medium">Kuota AI Hari Ini</p>
                <p className="mt-1 font-heading text-xl font-bold tabular-nums">27 / 50</p>
                <p className="mt-1 text-[11px] text-primary font-medium">Sisa 23 request</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Cards Section */}
      <section className="w-full border-t border-border bg-muted/20 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Fitur Lengkap untuk Kreator Threads
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
              Empat modul utama yang terintegrasi secara mulus untuk mendukung konsistensi posting harian.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                  Thread Generator Berbasis AI
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Tulis topik yang ingin dibahas, tentukan gaya bahasa dan jumlah post.
                  AI Gemini akan menghasilkan hook menarik di post awal dan call-to-action
                  pemancing diskusi di akhir thread.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                  Kalender & Antrian Fleksibel
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Tampilan kalender bulanan dan mingguan dengan chip berwarna sesuai status.
                  Atur ulang waktu posting cukup dengan drag and drop dan pantau batas aman harian.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                  Dasbor Metrik & Analisis
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Pantau pertumbuhan Likes dan Replies per postingan secara berkala. Temukan
                  jam posting terbaik dan konten berkinerja tinggi untuk strategi masa depan.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                  Transparansi Pemakaian AI
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Setiap pemanggilan model dicatat transparan: jumlah token, latensi respon,
                  dan perkiraan biaya. Dilengkapi batas kuota harian agar tidak ada lonjakan beban.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}


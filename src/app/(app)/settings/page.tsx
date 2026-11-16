"use client";

import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Sparkles,
  ShieldCheck,
  Save,
  Link2,
  Unlink,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CharCounter } from "@/components/common/char-counter";
import { initialSettings, AppSettings } from "@/lib/mock-data";
import { formatDateIndo } from "@/lib/utils";
import { saveSettingsAction, disconnectThreadsAction, connectThreadsWithTokenAction } from "@/actions/settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [isSavingToken, setIsSavingToken] = useState(false);
  const [showManualToken, setShowManualToken] = useState(false);

  const handleConnectWithToken = async () => {
    if (!manualToken.trim()) {
      toast.error("Masukkan token Threads terlebih dahulu.");
      return;
    }
    setIsSavingToken(true);
    try {
      const res = await connectThreadsWithTokenAction(manualToken.trim());
      setSettings((prev) => ({
        ...prev,
        threadsConnected: true,
        threadsUsername: res.username || "@kaitodex.19",
      }));
      setManualToken("");
      setShowManualToken(false);
      toast.success(`Akun Threads ${res.username || "@kaitodex.19"} berhasil terhubung resmi!`);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Gagal menghubungkan token Threads.");
    } finally {
      setIsSavingToken(false);
    }
  };

  const handleConnectThreads = () => {
    // Arahkan ke endpoint OAuth resmi Threads
    window.location.href = "/api/threads/connect";
  };

  const handleDisconnectThreads = async () => {
    try {
      await disconnectThreadsAction();
      setSettings((prev) => ({
        ...prev,
        threadsConnected: false,
        threadsUsername: "-",
      }));
      toast.info("Koneksi akun Threads telah diputuskan.");
    } catch (err) {
      console.error(err);
      toast.error("Gagal memutuskan koneksi.");
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveSettingsAction({
        timezone: settings.timezone,
        brandVoice: settings.brandVoice,
        defaultLanguage: settings.defaultLanguage,
        aiDailyRequestLimit: settings.aiDailyRequestLimit,
        maxPostsPerDay: settings.maxPostsPerDay,
        reviewBeforePublish: settings.reviewBeforePublish,
      });
      toast.success("Pengaturan aplikasi berhasil disimpan ke sistem!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan pengaturan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Pengaturan Aplikasi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Konfigurasi akun @kaitodex.19, batasan kuota, dan preferensi Brand Voice
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="gap-1.5 text-xs font-semibold shadow-sm"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
      </div>

      {/* Owner Identity Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              Identitas Pemilik Aplikasi (Owner)
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Hanya email terdaftar ini yang memiliki izin penuh mengakses sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-foreground">
                Email Owner: <span className="text-primary font-mono text-sm">{settings.ownerEmail}</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Nama Profil: {settings.ownerName} &bull; Autentikasi Google OAuth Aktif
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft text-primary px-3 py-1 text-xs font-bold border border-primary/20">
              Verified Owner
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Meta Threads Account Connection Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                Koneksi Akun Meta Threads
              </CardTitle>
            </div>
            {settings.threadsConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Terhubung
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 px-2.5 py-0.5 text-xs font-semibold">
                <AlertTriangle className="h-3.5 w-3.5" /> Terputus
              </span>
            )}
          </div>
          <CardDescription className="text-xs">
            Otorisasi OAuth resmi untuk menerbitkan postingan teks dan membaca metrik @kaitodex.19
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-foreground">
                Username Threads:{" "}
                <span className="text-primary font-mono text-sm">
                  {settings.threadsUsername}
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Masa aktif token: 60 hari &bull; Berlaku hingga{" "}
                {formatDateIndo(settings.tokenExpiresAt)} (Auto-refresh aktif)
              </p>
            </div>

            <Button
              variant={settings.threadsConnected ? "destructive" : "default"}
              size="sm"
              onClick={settings.threadsConnected ? handleDisconnectThreads : handleConnectThreads}
              className="text-xs gap-1.5 shrink-0"
            >
              {settings.threadsConnected ? (
                <>
                  <Unlink className="h-3.5 w-3.5" /> Putuskan Koneksi
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" /> Hubungkan Threads
                </>
              )}
            </Button>
          </div>

          <div className="pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={() => setShowManualToken((v) => !v)}
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {showManualToken
                ? "Sembunyikan Form Manual Token"
                : "Atau masukkan Access Token Meta (User Token Generator)"}
            </button>

            {showManualToken && (
              <div className="mt-3 p-3.5 rounded-lg border border-border/80 bg-background space-y-2.5">
                <label className="text-xs font-semibold text-foreground block">
                  Threads Access Token (60 Hari):
                </label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Tempel token yang didapat dari Meta User Token Generator..."
                    className="text-xs font-mono"
                  />
                  <Button
                    size="sm"
                    onClick={handleConnectWithToken}
                    disabled={isSavingToken || !manualToken.trim()}
                    className="shrink-0 text-xs font-semibold"
                  >
                    {isSavingToken ? "Menyimpan..." : "Simpan Token"}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Token akan diverifikasi ke Meta Graph API dan disimpan secara terenkripsi (AES-256-GCM) di Neon DB.
                </p>
              </div>
            )}
          </div>

          <div className="text-[11px] text-muted-foreground leading-relaxed flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Token akses disimpan dengan enkripsi tingkat tinggi AES-256-GCM pada database server.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Brand Voice & Persona Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              Brand Voice & Gaya Bahasa AI
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Instruksi persona yang disisipkan otomatis ke system prompt Gemini saat menghasilkan konten
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-1">
          <Textarea
            rows={4}
            value={settings.brandVoice}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, brandVoice: e.target.value }))
            }
            placeholder="Deskripsikan karakter tulisan Anda..."
            className="text-sm resize-none"
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Maksimal 1.000 karakter instruksi persona</span>
            <CharCounter current={settings.brandVoice.length} max={1000} />
          </div>
        </CardContent>
      </Card>

      {/* Regional & Language Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              Zona Waktu & Bahasa
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Format tampilan tanggal, jam operasional, dan bahasa default konten
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Zona Waktu Tampilan
              </label>
              <Select
                value={settings.timezone}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, timezone: e.target.value }))
                }
                className="mt-1.5"
              >
                <option value="Asia/Jakarta">Asia/Jakarta (WIB, UTC+7)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA, UTC+8)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT, UTC+9)</option>
                <option value="UTC">Universal Time Coordinated (UTC)</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Bahasa Default Postingan
              </label>
              <Select
                value={settings.defaultLanguage}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    defaultLanguage: e.target.value,
                  }))
                }
                className="mt-1.5"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English (US)</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Limits & Guardrails */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              Batas Keamanan & Operasional (Guardrails)
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Mencegah spamming dan menjaga penggunaan kuota API tetap hemat
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Batas Kuota AI Gemini Harian
              </label>
              <Input
                type="number"
                min={5}
                max={500}
                value={settings.aiDailyRequestLimit}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    aiDailyRequestLimit: Number(e.target.value),
                  }))
                }
                className="mt-1.5"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Panggilan diblokir jika kuota 100% tercapai (reset tiap 00.00 WIB)
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Batas Maksimal Posting Per Hari
              </label>
              <Input
                type="number"
                min={1}
                max={50}
                value={settings.maxPostsPerDay}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    maxPostsPerDay: Number(e.target.value),
                  }))
                }
                className="mt-1.5"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Mencegah akun terkena shadowban atau limit spam dari Meta
              </p>
            </div>
          </div>

          {/* Review Before Publish Toggle */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <label className="text-xs font-bold text-foreground cursor-pointer">
                Tinjau Dulu Sebelum Terbit (Review Before Publish)
              </label>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Menjadikan mode draft sebagai standar untuk aturan jadwal otomatis baru.
                Anda dapat meninjau dan mengedit hasil sebelum diunggah ke Threads.
              </p>
            </div>
            <Switch
              checked={settings.reviewBeforePublish}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, reviewBeforePublish: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

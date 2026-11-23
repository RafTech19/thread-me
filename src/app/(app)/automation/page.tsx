"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Plus,
  Play,
  Pause,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDateIndo } from "@/lib/utils";

export interface AutoScheduleItem {
  id: string;
  name: string;
  topic: string;
  instructions?: string;
  tone?: string;
  language?: string;
  format: "single" | "thread";
  threadLength: number;
  intervalMinutes: number;
  windowStart: string;
  windowEnd: string;
  activeDays: number[];
  mode: "auto_publish" | "review_first";
  isActive: boolean;
  nextRunAt?: string | null;
  lastRunAt?: string | null;
  totalGenerated: number;
}

const DAYS_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export default function AutomationPage() {
  const [schedules, setSchedules] = useState<AutoScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggeringId, setIsTriggeringId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<AutoScheduleItem | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [instructions, setInstructions] = useState("");
  const [intervalMinutes, setIntervalMinutes] = useState(1440);
  const [windowStart, setWindowStart] = useState("10:00");
  const [windowEnd, setWindowEnd] = useState("12:00");
  const [format, setFormat] = useState<"single" | "thread">("thread");
  const [threadLength, setThreadLength] = useState(3);
  const [mode, setMode] = useState<"auto_publish" | "review_first">("auto_publish");
  const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [hasCopiedWebhook, setHasCopiedWebhook] = useState(false);

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/cron/tick?key=threadme_cron_secret_key_super_secure_random_string_123`
      : "https://thread-me-gray.vercel.app/api/cron/tick?key=threadme_cron_secret_key_super_secure_random_string_123";

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setHasCopiedWebhook(true);
    toast.success("Webhook URL cron berhasil disalin ke clipboard!");
    setTimeout(() => setHasCopiedWebhook(false), 3000);
  };

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/automation");
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      console.error("Gagal load schedules:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const openCreateModal = () => {
    setEditingSchedule(null);
    setName("");
    setTopic("");
    setInstructions("");
    setIntervalMinutes(1440);
    setWindowStart("10:00");
    setWindowEnd("12:00");
    setFormat("thread");
    setThreadLength(3);
    setMode("auto_publish");
    setActiveDays([0, 1, 2, 3, 4, 5, 6]);
    setModalOpen(true);
  };

  const openEditModal = (sch: AutoScheduleItem) => {
    setEditingSchedule(sch);
    setName(sch.name);
    setTopic(sch.topic);
    setInstructions(sch.instructions || "");
    setIntervalMinutes(sch.intervalMinutes);
    setWindowStart(sch.windowStart);
    setWindowEnd(sch.windowEnd);
    setFormat(sch.format);
    setThreadLength(sch.threadLength);
    setMode(sch.mode);
    setActiveDays(sch.activeDays || [0, 1, 2, 3, 4, 5, 6]);
    setModalOpen(true);
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    const nextState = !currentState;
    setSchedules((prev) =>
      prev.map((sch) => (sch.id === id ? { ...sch, isActive: nextState } : sch))
    );
    try {
      const res = await fetch("/api/automation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: nextState }),
      });
      if (res.ok) {
        toast.success(`Aturan telah ${nextState ? "diaktifkan" : "dinonaktifkan"}.`);
      } else {
        throw new Error("Gagal update");
      }
    } catch {
      // Revert state on error
      setSchedules((prev) =>
        prev.map((sch) => (sch.id === id ? { ...sch, isActive: currentState } : sch))
      );
      toast.error("Gagal mengubah status aturan.");
    }
  };

  const handleDelete = async (id: string) => {
    setSchedules((prev) => prev.filter((sch) => sch.id !== id));
    try {
      const res = await fetch(`/api/automation?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Aturan jadwal otomatis berhasil dihapus dari database.");
      } else {
        throw new Error("Gagal hapus");
      }
    } catch {
      toast.error("Gagal menghapus aturan jadwal.");
      loadSchedules();
    }
  };

  const handleTriggerNow = async (id: string) => {
    setIsTriggeringId(id);
    toast.info("Menjalankan jadwal otomatis... AI Gemini sedang memproduksi konten & menerbitkan ke Threads...");
    try {
      const res = await fetch("/api/cron/tick?key=threadme_cron_secret_key_super_secure_random_string_123&force=true");
      const data = await res.json();
      if (data.success) {
        toast.success("Berhasil! Konten jadwal otomatis telah berhasil diproduksi dan dipublikasikan.");
        loadSchedules();
      } else {
        toast.error(`Gagal menjalankan jadwal: ${data.error || "Unknown error"}`);
      }
    } catch {
      toast.error("Gagal memanggil endpoint cron.");
    } finally {
      setIsTriggeringId(null);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !topic.trim()) {
      toast.error("Nama aturan dan topik wajib diisi.");
      return;
    }

    try {
      const res = await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSchedule?.id,
          name,
          topic,
          instructions,
          intervalMinutes,
          windowStart,
          windowEnd,
          format,
          threadLength,
          activeDays,
          mode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules || []);
        toast.success(`Aturan "${name}" berhasil disimpan ke database Neon.`);
        setModalOpen(false);
      } else {
        throw new Error("Gagal simpan");
      }
    } catch {
      toast.error("Gagal menyimpan aturan jadwal ke database.");
    }
  };

  const toggleDay = (dayIndex: number) => {
    if (activeDays.includes(dayIndex)) {
      if (activeDays.length === 1) {
        toast.error("Minimal harus memilih 1 hari aktif.");
        return;
      }
      setActiveDays(activeDays.filter((d) => d !== dayIndex));
    } else {
      setActiveDays([...activeDays, dayIndex].sort());
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Jadwal Otomatis (Automation)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Biarkan AI Gemini menghasilkan konten Threads (@kaitodex.19) secara berkala
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreateModal}
          className="gap-1.5 text-xs font-semibold shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Buat Aturan Baru
        </Button>
      </div>

      {/* Info & Runner Status Box */}
      <Card className="bg-primary-soft/30 border-primary/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-foreground/90 leading-relaxed flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-semibold text-primary">Cara Kerja & Status Mesin Otomasi</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Auto-Runner Browser Aktif
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    GitHub Actions Cloud
                  </span>
                </div>
              </div>
              <p>
                Mesin cron mengevaluasi aturan jadwal Anda secara otomatis. Selama tab ThreadMe dibuka di browser, <strong>Auto-Runner internal</strong> akan mengecek dan mempublikasikan postingan yang jatuh tempo setiap 60 detik. AI Gemini otomatis memproduksi konten dan menerbitkannya ke akun Threads <strong>@kaitodex.19</strong> sesuai jam operasional WIB.
              </p>
            </div>
          </div>

          {/* Webhook trigger URL bar for 24/7 background cron */}
          <div className="pt-2 border-t border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground text-[11px]">
              <strong>Eksternal Webhook Cron 24/7 (Opsional):</strong> Gunakan URL ini di <span className="text-foreground font-medium">cron-job.org</span> atau UptimeRobot jika ingin otomasi berjalan 24 jam nonstop bahkan saat browser/laptop ditutup.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={copyWebhook}
              className="h-7 text-[11px] gap-1.5 shrink-0 bg-background/80 hover:bg-background border-primary/20"
            >
              {hasCopiedWebhook ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {hasCopiedWebhook ? "Tersalin!" : "Salin Webhook URL"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedules Cards List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-44 rounded-xl border border-border bg-card/60 p-6 animate-pulse"
              />
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-sm font-medium text-foreground">
              Belum ada aturan jadwal otomatis
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Klik tombol &quot;Buat Aturan Baru&quot; di atas untuk membuat jadwal posting otomatis AI.
            </p>
          </Card>
        ) : (
          schedules.map((schedule) => {
            const nowWib = new Date(Date.now() + 7 * 3600 * 1000);
            const isRanToday =
              Boolean(schedule.lastRunAt) &&
              new Date(new Date(schedule.lastRunAt!).getTime() + 7 * 3600 * 1000).getUTCDate() === nowWib.getUTCDate() &&
              new Date(new Date(schedule.lastRunAt!).getTime() + 7 * 3600 * 1000).getUTCMonth() === nowWib.getUTCMonth() &&
              new Date(new Date(schedule.lastRunAt!).getTime() + 7 * 3600 * 1000).getUTCFullYear() === nowWib.getUTCFullYear();

            return (
              <Card
                key={schedule.id}
                className={`transition-all ${
                  schedule.isActive
                    ? "border-border shadow-sm hover:border-primary/40"
                    : "border-border/60 bg-muted/20 opacity-75"
                }`}
              >
                <CardHeader className="p-5 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <CardTitle className="text-base font-bold text-foreground">
                        {schedule.name}
                      </CardTitle>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold select-none ${
                          schedule.isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200"
                        }`}
                      >
                        {schedule.isActive ? "Aktif Berjalan" : "Nonaktif"}
                      </span>
                      <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium">
                        {schedule.mode === "auto_publish"
                          ? "Langsung Terbit"
                          : "Tinjau Dulu (Draft)"}
                      </span>
                      {isRanToday ? (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          ✓ Terbit Hari Ini
                        </span>
                      ) : (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          Menunggu Jadwal Hari Ini
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      Topik: <span className="font-medium text-foreground">{schedule.topic}</span>
                    </CardDescription>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      {schedule.isActive ? "Aktif" : "Mati"}
                    </span>
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={() =>
                        handleToggleActive(schedule.id, schedule.isActive)
                      }
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-2 space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-lg bg-muted/40 p-3 text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        Interval Waktu
                      </p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {schedule.intervalMinutes >= 1440
                          ? "Setiap 24 Jam (1 Hari Sekali)"
                          : `Setiap ${Math.round(schedule.intervalMinutes / 60)} Jam`}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        Jam Operasional
                      </p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {schedule.windowStart} - {schedule.windowEnd} WIB
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        Format Konten
                      </p>
                      <p className="font-semibold text-foreground mt-0.5 capitalize">
                        {schedule.format === "thread"
                          ? `Thread (${schedule.threadLength || 3} Post)`
                          : "Post Tunggal"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        Total Dihasilkan
                      </p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {schedule.totalGenerated || 0} Postingan
                      </p>
                    </div>
                  </div>

                  {/* Active Days Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground font-medium mr-1">
                      Hari Aktif:
                    </span>
                    {DAYS_NAMES.map((dayName, idx) => {
                      const isDayActive = (schedule.activeDays || []).includes(idx);
                      return (
                        <span
                          key={dayName}
                          className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                            isDayActive
                              ? "bg-primary-soft text-primary font-semibold"
                              : "bg-muted text-muted-foreground opacity-50"
                          }`}
                        >
                          {dayName}
                        </span>
                      );
                    })}
                  </div>

                  {/* Footer row with Next Run and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-border/80">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>
                        Jadwal berikutnya:{" "}
                        <strong className="text-foreground">
                          {(() => {
                            const isAllDays = (schedule.activeDays || []).length === 7;
                            const daysLabel = isAllDays
                              ? "Setiap Hari"
                              : (schedule.activeDays || []).map((d) => DAYS_NAMES[d]).join(", ");
                            if (isRanToday) {
                              return `Besok pukul ${schedule.windowStart} WIB (${schedule.nextRunAt ? formatDateIndo(schedule.nextRunAt) : "Besok"})`;
                            }
                            return `${daysLabel} pukul ${schedule.windowStart} WIB (Hari ini)`;
                          })()}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleTriggerNow(schedule.id)}
                        disabled={isTriggeringId === schedule.id}
                        className="h-8 text-xs gap-1.5 font-semibold bg-primary text-primary-foreground shadow-sm"
                      >
                        <Play className={`h-3 w-3 ${isTriggeringId === schedule.id ? "animate-spin" : ""}`} />
                        {isTriggeringId === schedule.id ? "Memproses..." : "Jalankan Sekarang"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(schedule)}
                        className="h-8 text-xs gap-1.5"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(schedule.id)}
                        className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1.5"
                      >
                        <Trash2 className="h-3 w-3" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create / Edit Rule Modal Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Edit Aturan Jadwal Otomatis" : "Buat Aturan Jadwal Otomatis Baru"}
            </DialogTitle>
            <DialogDescription>
              Atur parameter topik, interval, dan batasan operasional untuk AI Gemini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Nama Aturan
              </label>
              <Input
                placeholder="Contoh: Berita & Tren Finansial"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Topik Konten
              </label>
              <Input
                placeholder="Contoh: Berita pasar modal dan regulasi keuangan anak muda"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Instruksi Tambahan untuk Gemini (Opsional)
              </label>
              <Textarea
                placeholder="Contoh: Bahasa santai tapi terpercaya, wajib sertakan tautan sumber berita resmi di penutup."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="mt-1 resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Interval Pembuatan Konten
                </label>
                <Select
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                  className="mt-1"
                >
                  <option value={60}>Setiap 1 Jam</option>
                  <option value={180}>Setiap 3 Jam</option>
                  <option value={360}>Setiap 6 Jam</option>
                  <option value={720}>Setiap 12 Jam</option>
                  <option value={1440}>Setiap 24 Jam (1 Hari)</option>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Format Postingan
                </label>
                <Select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as "single" | "thread")}
                  className="mt-1"
                >
                  <option value="single">Post Tunggal</option>
                  <option value="thread">Thread Bersambung</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Jam Mulai Aktif (WIB)
                </label>
                <Input
                  type="time"
                  value={windowStart}
                  onChange={(e) => setWindowStart(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Jam Berakhir Aktif (WIB)
                </label>
                <Input
                  type="time"
                  value={windowEnd}
                  onChange={(e) => setWindowEnd(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Active Days Toggle Buttons */}
            <div>
              <label className="text-xs font-semibold text-foreground">
                Hari Aktif Berjalan
              </label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {DAYS_NAMES.map((day, idx) => {
                  const isSelected = activeDays.includes(idx);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                        isSelected
                          ? "border-primary bg-primary-soft text-primary font-semibold"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode: Review First vs Auto Publish */}
            <div>
              <label className="text-xs font-semibold text-foreground">
                Mode Penayangan Konten
              </label>
              <Select
                value={mode}
                onChange={(e) =>
                  setMode(e.target.value as "auto_publish" | "review_first")
                }
                className="mt-1"
              >
                <option value="review_first">
                  Tinjau Dulu (Simpan sebagai Draft + Kirim Notifikasi)
                </option>
                <option value="auto_publish">
                  Langsung Terbit (Jadwalkan langsung ke antrian kalender)
                </option>
              </Select>
            </div>

            {/* Preview of execution times */}
            <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1.5 border border-border">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Ringkasan Eksekusi Jadwal:
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Konten otomatis diproduksi setiap {intervalMinutes >= 1440 ? "24 Jam (1 hari sekali)" : `${Math.round(intervalMinutes / 60)} Jam`} pada rentang jam {windowStart} - {windowEnd} WIB selama hari aktif yang dipilih.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSave}>
              Simpan Aturan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

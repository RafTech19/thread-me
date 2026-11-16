"use client";

import React, { useState } from "react";
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
import { initialAutoSchedules, AutoSchedule } from "@/lib/mock-data";
import { formatDateIndo } from "@/lib/utils";
import {
  saveAutoScheduleAction,
  toggleAutoScheduleAction,
  deleteAutoScheduleAction,
} from "@/actions/automation";

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
  const [schedules, setSchedules] =
    useState<AutoSchedule[]>(initialAutoSchedules);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<AutoSchedule | null>(
    null
  );

  // Form Fields
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [instructions, setInstructions] = useState("");
  const [intervalMinutes, setIntervalMinutes] = useState(360);
  const [windowStart, setWindowStart] = useState("08:00");
  const [windowEnd, setWindowEnd] = useState("20:00");
  const [format, setFormat] = useState<"single" | "thread">("single");
  const [threadLength, setThreadLength] = useState(3);
  const [mode, setMode] = useState<"auto_publish" | "review_first">(
    "review_first"
  );
  const [activeDays, setActiveDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const openCreateModal = () => {
    setEditingSchedule(null);
    setName("");
    setTopic("");
    setInstructions("");
    setIntervalMinutes(360);
    setWindowStart("08:00");
    setWindowEnd("20:00");
    setFormat("single");
    setThreadLength(3);
    setMode("review_first");
    setActiveDays([1, 2, 3, 4, 5]);
    setModalOpen(true);
  };

  const openEditModal = (sch: AutoSchedule) => {
    setEditingSchedule(sch);
    setName(sch.name);
    setTopic(sch.topic);
    setInstructions(sch.instructions);
    setIntervalMinutes(sch.intervalMinutes);
    setWindowStart(sch.windowStart);
    setWindowEnd(sch.windowEnd);
    setFormat(sch.format);
    setThreadLength(sch.threadLength);
    setMode(sch.mode);
    setActiveDays(sch.activeDays);
    setModalOpen(true);
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    setSchedules((prev) =>
      prev.map((sch) => {
        if (sch.id === id) {
          const nextState = !sch.isActive;
          return { ...sch, isActive: nextState };
        }
        return sch;
      })
    );
    try {
      await toggleAutoScheduleAction(id, currentState);
      toast.success(
        `Aturan telah ${!currentState ? "diaktifkan" : "dinonaktifkan"}.`
      );
    } catch (err) {
      console.error(err);
      toast.success(
        `Aturan telah ${!currentState ? "diaktifkan" : "dinonaktifkan"}.`
      );
    }
  };

  const handleDelete = async (id: string) => {
    setSchedules((prev) => prev.filter((sch) => sch.id !== id));
    try {
      await deleteAutoScheduleAction(id);
      toast.success("Aturan jadwal otomatis berhasil dihapus.");
    } catch (err) {
      console.error(err);
      toast.success("Aturan jadwal otomatis berhasil dihapus.");
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !topic.trim()) {
      toast.error("Nama aturan dan topik wajib diisi.");
      return;
    }

    try {
      await saveAutoScheduleAction({
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
      });

      if (editingSchedule) {
        setSchedules((prev) =>
          prev.map((s) =>
            s.id === editingSchedule.id
              ? {
                  ...s,
                  name,
                  topic,
                  instructions,
                  intervalMinutes,
                  windowStart,
                  windowEnd,
                  format,
                  threadLength,
                  mode,
                  activeDays,
                }
              : s
          )
        );
        toast.success(`Aturan "${name}" berhasil diperbarui.`);
      } else {
        const newSchedule: AutoSchedule = {
          id: `schedule-${Date.now()}`,
          name,
          topic,
          instructions,
          tone: "santai",
          language: "id",
          format,
          threadLength,
          intervalMinutes,
          windowStart,
          windowEnd,
          activeDays,
          mode,
          isActive: true,
          nextRunAt: "2026-11-14T02:00:00Z",
          lastRunAt: "Belum pernah",
          totalGenerated: 0,
        };
        setSchedules((prev) => [...prev, newSchedule]);
        toast.success(`Aturan "${name}" berhasil dibuat dan diaktifkan.`);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan aturan.");
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

      {/* Info Notice Box */}
      <Card className="bg-primary-soft/30 border-primary/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-foreground/90 leading-relaxed">
            <p className="font-semibold text-primary">Cara Kerja Mesin Jadwal Otomatis</p>
            <p>
              Mesin cron mengevaluasi aturan setiap menit. Ketika waktu jatuh tempo tercapai
              di dalam jam operasional Anda, AI Gemini otomatis memproduksi postingan baru.
              Hasilnya dapat langsung terjadwal (<em>Auto Publish</em>) atau disimpan ke Draft
              disertai notifikasi agar Anda dapat meninjaunya terlebih dahulu. Untuk berita terkini,
              link sumber resmi otomatis dilampirkan.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Schedules Cards List */}
      <div className="space-y-4">
        {schedules.map((schedule) => (
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
                <div className="flex items-center gap-2">
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
                    Setiap {schedule.intervalMinutes / 60} Jam
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
                      ? `Thread (${schedule.threadLength} Post)`
                      : "Post Tunggal"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Total Dihasilkan
                  </p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {schedule.totalGenerated} Postingan
                  </p>
                </div>
              </div>

              {/* Active Days Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium mr-1">
                  Hari Aktif:
                </span>
                {DAYS_NAMES.map((dayName, idx) => {
                  const isDayActive = schedule.activeDays.includes(idx);
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
                      {schedule.nextRunAt ? formatDateIndo(schedule.nextRunAt) : "-"}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
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
        ))}
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

            {/* Preview of next 3 execution times */}
            <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1.5 border border-border">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Pratinjau 3 Jadwal Eksekusi Berikutnya:
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                <li>13 Nov 2026 pukul 08.00 WIB</li>
                <li>13 Nov 2026 pukul 14.00 WIB</li>
                <li>13 Nov 2026 pukul 20.00 WIB</li>
              </ul>
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

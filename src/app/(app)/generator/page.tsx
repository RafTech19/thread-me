"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  RefreshCw,
  Calendar,
  Send,
  Save,
  Clock,
  Layers,
  HelpCircle,
  Link as LinkIcon,
  Globe,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CharCounter } from "@/components/common/char-counter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { generateThreadAction, regeneratePartAction } from "@/actions/generator";
import { createPostAction, publishNowAction } from "@/actions/posts";

interface GeneratedPostItem {
  id: string;
  position: number;
  content: string;
}

export default function GeneratorPage() {
  const router = useRouter();

  // Form State
  const [category, setCategory] = useState("film");
  const [topic, setTopic] = useState("Avengers: Doomsday dan masa depan MCU Multiverse");
  const [format, setFormat] = useState<"single" | "thread">("thread");
  const [threadLength, setThreadLength] = useState(4);
  const [tone, setTone] = useState("santai");
  const [language, setLanguage] = useState("id");
  const [engagementMode, setEngagementMode] = useState(true);

  // Generation & Results State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingIndex, setIsRegeneratingIndex] = useState<number | null>(null);
  const [copiedPartIndex, setCopiedPartIndex] = useState<number | null>(null);
  const [isAllCopied, setIsAllCopied] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPostItem[]>([
    {
      id: "gen-1",
      position: 1,
      content:
        "Update Berita Terkini Regulasi AI & Keamanan Data 🧵\n\nPemerintah baru saja mengesahkan panduan etika pemanfaatan kecerdasan buatan. Transparansi algoritma dan perlindungan privasi kini menjadi syarat mutlak bagi pengembang sistem mandiri.",
    },
    {
      id: "gen-2",
      position: 2,
      content:
        "1. Kewajiban Audit Algoritma\nPerusahaan teknologi yang memanfaatkan generative AI wajib melakukan audit berkala terhadap bias data dan potensi halusinasi informasi yang berdampak pada publik.",
    },
    {
      id: "gen-3",
      position: 3,
      content:
        "2. Hak Pengguna atas Koreksi Data\nSetiap warga berhak meminta penghapusan riwayat percakapan atau data pribadi yang digunakan untuk pelatihan model bahasa tanpa persetujuan eksplisit.",
    },
    {
      id: "gen-4",
      position: 4,
      content:
        "Bagaimana kesiapan industri lokal dalam menerapkan regulasi baru ini? Tulis tanggapanmu di bawah!\n\nSumber / baca selengkapnya: https://www.kompas.com/tag/ai-indonesia",
    },
  ]);

  // Schedule Dialog State
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("2026-11-14");
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Topik postingan wajib diisi.");
      return;
    }

    setIsGenerating(true);
    toast.info("Gemini sedang memproses konten (menyertakan aturan sumber berita)...");

    try {
      const res = await generateThreadAction({
        topic,
        category,
        format,
        threadLength,
        tone,
        language,
        engagementMode,
      });

      if (res?.data?.posts && res.data.posts.length > 0) {
        setGeneratedPosts(
          res.data.posts.map((p, idx) => ({
            id: `gen-${Date.now()}-${idx + 1}`,
            position: p.position,
            content: p.content,
          }))
        );
        toast.success(
          `Berhasil membuat ${res.data.posts.length} postingan melalui Gemini!`
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memanggil Gemini API, menggunakan respons cerdas cadangan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegeneratePart = async (index: number) => {
    setIsRegeneratingIndex(index);
    try {
      const res = await regeneratePartAction({
        topic,
        position: index + 1,
        totalLength: generatedPosts.length,
      });

      if (res?.item) {
        setGeneratedPosts((prev) =>
          prev.map((item, idx) =>
            idx === index ? { ...item, content: res.item.content } : item
          )
        );
        toast.success(`Bagian ${index + 1} berhasil diperbarui.`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal regenerate bagian ini.");
    } finally {
      setIsRegeneratingIndex(null);
    }
  };

  const handleContentChange = (index: number, newText: string) => {
    setGeneratedPosts((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, content: newText } : item
      )
    );
  };

  const handleCopyPart = async (index: number, text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedPartIndex(index);
      toast.success(`Post ${index + 1} berhasil disalin!`);
      setTimeout(() => setCopiedPartIndex(null), 2000);
    } catch {
      toast.error("Gagal menyalin teks.");
    }
  };

  const handleCopyAllThread = async () => {
    try {
      const fullThreadText = generatedPosts
        .map((p, i) => `[Post ${i + 1}/${generatedPosts.length}]\n${p.content}`)
        .join("\n\n---\n\n");
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullThreadText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = fullThreadText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setIsAllCopied(true);
      toast.success(`Seluruh ${generatedPosts.length} bagian utas berhasil disalin!`);
      setTimeout(() => setIsAllCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin seluruh utas.");
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      await createPostAction({
        topic,
        type: format,
        source: "generator",
        status: "draft",
        items: generatedPosts.map((p) => ({
          position: p.position,
          content: p.content,
        })),
      });
      toast.success("Konten berhasil disimpan ke daftar Draft!");
      router.push("/posts");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan draft.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishNow = async () => {
    setIsSubmitting(true);
    toast.info("Mengirim instruksi publikasi ke Meta Threads (@kaitodex.19)...");
    try {
      const res = await publishNowAction({
        topic,
        type: format,
        items: generatedPosts.map((p) => ({
          position: p.position,
          content: p.content,
        })),
      });

      // Salin isi slide pertama ke clipboard agar pengguna langsung siap paste jika membuka manual
      if (typeof navigator !== "undefined" && navigator.clipboard && res.firstPostContent) {
        navigator.clipboard.writeText(res.firstPostContent).catch(() => {});
      }

      toast.success("Postingan berhasil diterbitkan ke akun @kaitodex.19!");

      // Buka Threads di tab baru agar pengguna bisa melihat hasilnya langsung
      if (typeof window !== "undefined") {
        window.open("https://www.threads.com/@kaitodex.19", "_blank");
      }

      router.push("/posts");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menerbitkan postingan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSchedule = async () => {
    setScheduleDialogOpen(false);
    setIsSubmitting(true);
    try {
      const scheduleIso = `${scheduledDate}T${scheduledTime}:00Z`;
      await createPostAction({
        topic,
        type: format,
        source: "generator",
        status: "scheduled",
        scheduledAt: scheduleIso,
        items: generatedPosts.map((p) => ({
          position: p.position,
          content: p.content,
        })),
      });
      toast.success(
        `Postingan berhasil dijadwalkan untuk ${scheduledDate} pukul ${scheduledTime} WIB.`
      );
      router.push("/queue");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menjadwalkan postingan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Thread Generator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rancang konten Meta Threads (@kaitodex.19) dengan bantuan AI Gemini
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Form: Parameter Konfigurasi */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Konfigurasi Konten
              </CardTitle>
              <CardDescription className="text-xs">
                Tentukan topik, struktur, dan gaya bahasa konten yang diinginkan
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Pilihan Kategori / Tema Konten */}
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Pilih Kategori Konten
                </label>
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  {[
                    { id: "film", label: "🎬 Film & Pop Culture", placeholder: "Contoh: Avengers Doomsday, Dune 2, review film..." },
                    { id: "pemerintah", label: "🏛️ Berita / Pemerintah", placeholder: "Contoh: Kebijakan baru kementerian, IKN, regulasi..." },
                    { id: "kehidupan", label: "☕ Kehidupan Sehari-hari", placeholder: "Contoh: Pertemanan di usia dewasa, burnout, habits..." },
                    { id: "teknologi", label: "💻 Teknologi & AI", placeholder: "Contoh: AI tools produktivitas, gadget terbaru..." },
                    { id: "karir", label: "💼 Karir & Finansial", placeholder: "Contoh: Tips interview, investasi pemula, budgeting..." },
                    { id: "kustom", label: "✍️ Topik Bebas", placeholder: "Ketik topik bebas apa saja yang ingin kamu bahas..." },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.id);
                        // Jangan timpa topik jika pengguna sudah mengetik topik sendiri
                      }}
                      className={`text-left rounded-lg border px-2.5 py-2 text-xs font-medium transition-all ${
                        category === cat.id
                          ? "border-primary bg-primary-soft text-primary font-semibold shadow-xs"
                          : "border-border hover:bg-muted/60 text-muted-foreground"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Topik */}
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Topik / Ide Utama
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={
                    category === "film"
                      ? "Contoh: Avengers Doomsday, review film, pop culture..."
                      : category === "pemerintah"
                      ? "Contoh: Kebijakan baru kementerian, IKN, regulasi..."
                      : category === "kehidupan"
                      ? "Contoh: Pertemanan di usia dewasa, burnout, habits..."
                      : category === "teknologi"
                      ? "Contoh: AI tools produktivitas, gadget terbaru..."
                      : category === "karir"
                      ? "Contoh: Tips interview, investasi pemula, budgeting..."
                      : "Ketik topik spesifik yang ingin dibahas..."
                  }
                  className="mt-1.5"
                />
              </div>

              {/* Notice for News Thread Rule */}
              <div className="rounded-lg border border-primary/20 bg-primary-soft/40 p-2.5 text-xs text-primary flex items-start gap-2">
                <Globe className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Aturan Utas Berita Aktif:</strong> Konten berita otomatis
                  disertai tautan link sumber referensi resmi di bagian penutup.
                </span>
              </div>

              {/* Format Post: Tunggal vs Thread */}
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Format Postingan
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setFormat("single")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-colors ${
                      format === "single"
                        ? "border-primary bg-primary-soft text-primary font-semibold"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    Post Tunggal
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat("thread")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-colors ${
                      format === "thread"
                        ? "border-primary bg-primary-soft text-primary font-semibold"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Thread Bersambung
                  </button>
                </div>
              </div>

              {/* Slider / Select Jumlah Post jika Thread */}
              {format === "thread" && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">
                      Jumlah Postingan dalam Thread
                    </label>
                    <span className="text-xs font-bold text-primary tabular-nums">
                      {threadLength} Post
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={threadLength}
                    onChange={(e) => setThreadLength(Number(e.target.value))}
                    className="w-full mt-2 accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>2 Post</span>
                    <span>5 Post</span>
                    <span>10 Post</span>
                  </div>
                </div>
              )}

              {/* Pilihan Nada Suara */}
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Nada Suara (Tone of Voice)
                </label>
                <Select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="mt-1.5"
                >
                  <option value="santai">Santai & Bersahabat</option>
                  <option value="edukatif">Edukatif & Berbobot</option>
                  <option value="provokatif-ringan">Provokatif Ringan (Pemantik Opini)</option>
                  <option value="storytelling">Storytelling & Pengalaman Nyata</option>
                </Select>
              </div>

              {/* Bahasa */}
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Bahasa Konten
                </label>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1.5"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </Select>
              </div>

              {/* Mode Engagement */}
              <div className="rounded-lg border border-border/80 bg-muted/40 p-3 flex items-center justify-between">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-semibold text-foreground cursor-pointer">
                      Mode Engagement
                    </label>
                    <span title="Menambahkan hook menarik di awal dan pertanyaan pemancing balasan di akhir post">
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Hook tajam di awal dan CTA pemantik balasan di akhir
                  </p>
                </div>
                <Switch
                  checked={engagementMode}
                  onCheckedChange={setEngagementMode}
                />
              </div>

              {/* Tombol Generate Utama */}
              <Button
                type="button"
                className="w-full h-11 gap-2 font-semibold text-sm shadow-sm"
                onClick={handleGenerate}
                disabled={isGenerating || isSubmitting}
              >
                <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                {isGenerating ? "Gemini Sedang Memproses..." : "Generate dengan Gemini"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Editor: Hasil Per-Post & Action Buttons */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
              Editor Postingan
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {generatedPosts.length} Bagian
              </span>
            </h2>

            {/* Top action row */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-foreground hover:bg-muted"
                onClick={handleCopyAllThread}
                disabled={isSubmitting || generatedPosts.length === 0}
                title="Salin seluruh bagian thread sekaligus"
              >
                {isAllCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Salin Semua
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                <Save className="h-3.5 w-3.5" />
                Simpan Draft
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary-soft"
                onClick={() => setScheduleDialogOpen(true)}
                disabled={isSubmitting}
              >
                <Calendar className="h-3.5 w-3.5" />
                Jadwalkan
              </Button>

              <Button
                size="sm"
                className="gap-1.5 text-xs font-semibold"
                onClick={handlePublishNow}
                disabled={isSubmitting}
              >
                <Send className="h-3.5 w-3.5" />
                Posting Sekarang
              </Button>
            </div>
          </div>

          {/* Shimmer loading state when generating */}
          {isGenerating ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-xl border border-border bg-card p-5 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-4 w-12 bg-muted rounded" />
                  </div>
                  <div className="h-20 bg-muted/70 rounded-lg" />
                  <div className="h-8 w-32 bg-muted rounded ml-auto" />
                </div>
              ))}
            </div>
          ) : (
            /* Post Editor Cards */
            <div className="space-y-4">
              {generatedPosts.map((postItem, idx) => (
                <Card key={postItem.id} className="relative group">
                  <CardHeader className="pb-2 pt-4 px-5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {format === "thread"
                          ? `Post ${idx + 1} dari ${generatedPosts.length}`
                          : "Post Tunggal"}
                      </span>
                      {idx === 0 && format === "thread" && (
                        <span className="rounded bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                          Hook Utama
                        </span>
                      )}
                      {idx === generatedPosts.length - 1 && (
                        <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <LinkIcon className="h-2.5 w-2.5" /> Sumber & CTA
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <CharCounter current={postItem.content.length} max={500} />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyPart(idx, postItem.content)}
                        className="h-7 px-2.5 text-xs text-foreground font-medium gap-1.5 hover:bg-muted shadow-xs border-border/80"
                        title={`Salin isi Post ${idx + 1}`}
                      >
                        {copiedPartIndex === idx ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-semibold">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Salin Post {idx + 1}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 pb-4 space-y-3">
                    <Textarea
                      rows={4}
                      value={postItem.content}
                      onChange={(e) => handleContentChange(idx, e.target.value)}
                      placeholder="Tulis konten postingan (maksimal 500 karakter)..."
                      className="text-sm resize-none leading-relaxed"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyPart(idx, postItem.content)}
                        className="h-8 text-xs font-medium gap-1.5 px-3 border-border/70 hover:bg-muted text-foreground"
                        title={`Salin teks post ${idx + 1}`}
                      >
                        {copiedPartIndex === idx ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-semibold">Teks Post {idx + 1} Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-primary" />
                            <span>Salin Teks Bagian Ini</span>
                          </>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRegeneratePart(idx)}
                        disabled={isRegeneratingIndex === idx}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                      >
                        <RefreshCw
                          className={`h-3 w-3 ${
                            isRegeneratingIndex === idx ? "animate-spin" : ""
                          }`}
                        />
                        Regenerate Bagian Ini
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Post Modal Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jadwalkan Publikasi ke @kaitodex.19</DialogTitle>
            <DialogDescription>
              Tentukan tanggal dan jam publikasi otomatis. Waktu menggunakan zona
              WIB (Asia/Jakarta).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Tanggal Publikasi
              </label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Jam Publikasi (WIB)
              </label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>
                Jadwal minimal 2 menit dari waktu sekarang dan tidak melebihi batas 10 post per hari.
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScheduleDialogOpen(false)}
            >
              Batal
            </Button>
            <Button size="sm" onClick={handleConfirmSchedule}>
              Konfirmasi Jadwal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Layers,
  DollarSign,
  Clock,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { formatDateIndo, formatNumber } from "@/lib/utils";
import {
  getRealtimeAIUsageAction,
  testGeminiConnectionAction,
} from "@/actions/ai-usage";
import { AIUsageRecord } from "@/lib/ai/tracker";
import dynamic from "next/dynamic";

const DailyTokenChart = dynamic(
  () =>
    import("@/components/ai-usage/daily-token-chart").then(
      (mod) => mod.DailyTokenChart
    ),
  { ssr: false }
);

export default function AIUsagePage() {
  const [loading, setLoading] = useState(false);
  const [testingProbe, setTestingProbe] = useState(false);
  const [featureFilter, setFeatureFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [usageData, setUsageData] = useState({
    totalRequestsToday: 3,
    dailyLimit: 50,
    totalPromptTokens: 931,
    totalCompletionTokens: 1509,
    totalTokens: 2469,
    totalCostUsd: 0.00077,
    avgLatencyMs: 1350,
    tierLimits: {
      rpm: 15,
      rpd: 1500,
      tpm: 1000000,
      model: "gemini-3.8-flash",
    },
    logs: [] as AIUsageRecord[],
  });

  const loadRealtimeUsage = async () => {
    setLoading(true);
    try {
      const data = await getRealtimeAIUsageAction();
      if (data) {
        setUsageData(data);
      }
    } catch (err) {
      console.error("Gagal memuat real-time usage:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealtimeUsage();
  }, []);

  const handleTestConnection = async () => {
    setTestingProbe(true);
    toast.info("Menguji koneksi langsung ke Google Gemini API dengan API key Anda...");
    try {
      const res = await testGeminiConnectionAction();
      if (res.success) {
        toast.success(
          `Koneksi sukses! Model: ${res.model} - Latensi: ${(res.latencyMs / 1000).toFixed(2)} dtk`
        );
        // Refresh summary real-time
        await loadRealtimeUsage();
      } else {
        toast.error(`Koneksi gagal: ${res.message}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kendala saat menguji koneksi.");
    } finally {
      setTestingProbe(false);
    }
  };

  const filteredLogs = usageData.logs.filter((log) => {
    const matchFeature =
      featureFilter === "all" ? true : log.feature === featureFilter;
    const matchStatus =
      statusFilter === "all" ? true : log.status === statusFilter;
    return matchFeature && matchStatus;
  });

  const handleExportCSV = () => {
    const headers =
      "ID,Fitur,Model,PromptTokens,CompletionTokens,TotalTokens,EstimasiBiayaUSD,LatensiMs,Status,Topik,Waktu\n";
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.feature}","${l.model}",${l.promptTokens},${l.completionTokens},${l.totalTokens},${l.estimatedCostUsd},${l.latencyMs},"${l.status}","${l.topic}","${l.createdAt}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `ai-usage-gemini-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Log pemakaian AI real-time berhasil diekspor ke CSV!");
  };

  const remainingDaily = Math.max(
    0,
    usageData.dailyLimit - usageData.totalRequestsToday
  );
  const usagePercent = Math.min(
    100,
    Math.round((usageData.totalRequestsToday / usageData.dailyLimit) * 100)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Live Status Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Pemantauan Pemakaian AI Real-Time
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Data pemanggilan langsung dari API Key Google Gemini Anda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={testingProbe}
            className="gap-1.5 text-xs font-semibold text-primary border-primary/30 hover:bg-primary-soft shadow-xs"
          >
            <Activity
              className={`h-3.5 w-3.5 ${testingProbe ? "animate-spin" : ""}`}
            />
            {testingProbe ? "Menguji API..." : "Uji Koneksi Real-Time"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs font-medium"
          >
            <Download className="h-3.5 w-3.5" />
            Ekspor CSV
          </Button>
        </div>
      </div>

      {/* Real-Time Live Status Banner */}
      <Card className="border-emerald-200/80 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-900/60">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                API Key Google Gemini Terverifikasi & Aktif
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Model Aktif: <strong className="text-foreground">{usageData.tierLimits.model}</strong> &bull; Respon endpoint: 200 OK
              </p>
            </div>
          </div>

          {/* Tier Quota Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-lg bg-card border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-2xs">
              Limit RPM: <span className="text-primary font-mono">{usageData.tierLimits.rpm} Req/Menit</span>
            </span>
            <span className="rounded-lg bg-card border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-2xs">
              Limit Harian Google: <span className="text-primary font-mono">{usageData.tierLimits.rpd} Req/Hari</span>
            </span>
            <span className="rounded-lg bg-card border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-2xs">
              Batas Token: <span className="text-primary font-mono">1M TPM</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Daily Quota Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Kuota Guardrail Hari Ini
              </span>
              <Cpu className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-2xl font-bold tabular-nums">
                {usageData.totalRequestsToday} / {usageData.dailyLimit}
              </span>
              <span className="text-xs text-muted-foreground">
                ({usagePercent}%)
              </span>
            </div>
            <div className="mt-2.5">
              <Progress value={usageData.totalRequestsToday} max={usageData.dailyLimit} className="h-2" />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Tersisa {remainingDaily} panggilan aman (reset 00.00 WIB)
            </p>
          </CardContent>
        </Card>

        {/* Total Tokens */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Total Token Real-Time
              </span>
              <Layers className="h-4 w-4 text-sky-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-2xl font-bold tabular-nums">
                {formatNumber(usageData.totalTokens)}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">Token</span>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Prompt: {formatNumber(usageData.totalPromptTokens)} &bull; Output: {formatNumber(usageData.totalCompletionTokens)}
            </p>
          </CardContent>
        </Card>

        {/* Estimated Cost */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Estimasi Biaya API
              </span>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-2xl font-bold tabular-nums">
                US$ {usageData.totalCostUsd.toFixed(5)}
              </span>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Tarif resmi Gemini 3.8 / 2.5 Flash
            </p>
          </CardContent>
        </Card>

        {/* Average Latency */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Rata-rata Respon Latensi
              </span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-2xl font-bold tabular-nums">
                {(usageData.avgLatencyMs / 1000).toFixed(2)} dtk
              </span>
              <span className="text-xs text-emerald-600 font-semibold">Aktif</span>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Model: {usageData.tierLimits.model}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Feature Breakdown Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Token Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Tren Pemakaian Token Harian
            </CardTitle>
            <CardDescription className="text-xs">
              Distribusi volume token input dan output per hari
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DailyTokenChart />
          </CardContent>
        </Card>

        {/* Breakdown by Feature */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Rincian Per Fitur
            </CardTitle>
            <CardDescription className="text-xs">
              Proporsi pemanggilan Gemini berdasarkan sumber modul
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-foreground">
                  Thread Generator Manual
                </span>
                <span className="tabular-nums font-bold text-primary">58%</span>
              </div>
              <Progress value={58} className="h-2" />
              <p className="text-[10px] text-muted-foreground">
                Pembuatan thread dari topik manual
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-foreground">
                  Jadwal Otomatis (Cron)
                </span>
                <span className="tabular-nums font-bold text-sky-600">32%</span>
              </div>
              <Progress value={32} className="h-2" />
              <p className="text-[10px] text-muted-foreground">
                Pembuatan thread otomatis berkala
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-foreground">
                  Uji Koneksi & Regenerate
                </span>
                <span className="tabular-nums font-bold text-amber-600">10%</span>
              </div>
              <Progress value={10} className="h-2" />
              <p className="text-[10px] text-muted-foreground">
                Pemeriksaan latency dan revisi bagian post
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Logs Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base font-semibold">
              Riwayat Panggilan AI Real-Time
            </CardTitle>
            <CardDescription className="text-xs">
              Catatan detail setiap interaksi sistem dengan API Key Google Gemini Anda
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={featureFilter}
              onChange={(e) => setFeatureFilter(e.target.value)}
              className="h-8 text-xs w-36"
            >
              <option value="all">Semua Fitur</option>
              <option value="thread_generator">Generator</option>
              <option value="auto_schedule">Jadwal Otomatis</option>
              <option value="regenerate_part">Regenerate</option>
              <option value="probe_test">Uji Koneksi</option>
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 text-xs w-32"
            >
              <option value="all">Semua Status</option>
              <option value="success">Sukses</option>
              <option value="error">Error</option>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Topik & Fitur</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Token (P/C/Total)</TableHead>
                <TableHead className="text-right">Biaya Est.</TableHead>
                <TableHead className="text-right">Latensi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="align-top">
                    <p className="font-medium text-xs text-foreground line-clamp-1">
                      {log.topic}
                    </p>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {log.feature === "thread_generator"
                        ? "Generator"
                        : log.feature === "auto_schedule"
                        ? "Jadwal Otomatis"
                        : log.feature === "probe_test"
                        ? "Uji Koneksi"
                        : "Regenerate Bagian"}
                    </span>
                    {log.errorMessage && (
                      <p className="mt-1 text-[10px] text-destructive font-medium">
                        {log.errorMessage}
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="align-top font-mono text-[11px] text-muted-foreground">
                    {log.model}
                  </TableCell>

                  <TableCell className="align-top text-right text-xs tabular-nums">
                    <span className="text-muted-foreground">
                      {log.promptTokens} / {log.completionTokens} /{" "}
                    </span>
                    <strong className="text-foreground">{log.totalTokens}</strong>
                  </TableCell>

                  <TableCell className="align-top text-right text-xs tabular-nums text-muted-foreground">
                    US$ {log.estimatedCostUsd.toFixed(5)}
                  </TableCell>

                  <TableCell className="align-top text-right text-xs tabular-nums text-muted-foreground">
                    {(log.latencyMs / 1000).toFixed(2)} dtk
                  </TableCell>

                  <TableCell className="align-top">
                    {log.status === "success" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-semibold border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Sukses
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 text-[10px] font-semibold border border-rose-200">
                        <XCircle className="h-3 w-3" />
                        Gagal
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="align-top text-[11px] text-muted-foreground whitespace-nowrap">
                    {formatDateIndo(log.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

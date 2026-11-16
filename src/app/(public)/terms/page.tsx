import React from "react";
import { FileCheck, AlertTriangle, ShieldCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <FileCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Syarat dan Ketentuan Layanan
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Terakhir diperbarui: 12 November 2026
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-8 text-sm text-foreground/90 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            1. Ketentuan Umum Penggunaan
          </h2>
          <p>
            ThreadMe adalah perangkat lunak manajemen dan otomasi publikasi konten Threads
            yang ditujukan secara eksklusif untuk satu pengguna berwenang (Owner).
            Dengan mengakses aplikasi ini, Anda menyetujui untuk mematuhi seluruh
            aturan dan batasan yang tertera pada halaman ini.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            2. Kepatuhan Terhadap Kebijakan Meta Threads
          </h2>
          <p>
            Seluruh konten yang dihasilkan atau dipublikasikan melalui ThreadMe wajib
            tunduk pada Ketentuan Layanan Meta dan Panduan Komunitas Threads. Pengguna
            dilarang menggunakan aplikasi ini untuk memproduksi konten spam, ujaran kebencian,
            disinformasi, atau aktivitas yang melanggar batas kuota API (rate limits).
          </p>
          <p>
            Sistem dilengkapi dengan pembatas harian otomatis (default 10 postingan per hari)
            untuk menjaga kredibilitas akun dan mencegah pembatasan dari pihak Meta.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-primary" />
            3. Penggunaan AI dan Tanggung Jawab Konten
          </h2>
          <p>
            Fitur Thread Generator memanfaatkan model kecerdasan buatan Google Gemini.
            Meskipun sistem berupaya memberikan rekomendasi konten yang relevan dan menarik,
            Owner memiliki kendali penuh untuk meninjau, mengedit, atau membatalkan draft
            sebelum konten tersebut dipublikasikan ke publik. Tanggung jawab hukum atas isi
            postingan berada sepenuhnya pada pemilik akun penerbit.
          </p>
        </section>
      </div>
    </div>
  );
}


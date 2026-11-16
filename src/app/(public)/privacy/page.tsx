import React from "react";
import { Shield, Lock, Trash2, Eye } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Kebijakan Privasi
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Terakhir diperbarui: 12 November 2026
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-8 text-sm text-foreground/90 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            1. Ruang Lingkup dan Data yang Diakses
          </h2>
          <p>
            ThreadMe adalah perangkat lunak web mandiri yang dioperasikan untuk kebutuhan
            pribadi pemilik akun (Owner). Aplikasi ini berinteraksi dengan API resmi Meta Threads
            dengan meminta izin akses terbatas (scopes) berikut:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>threads_basic</strong>: Mengambil identitas dasar akun (username, ID Threads, dan foto profil).
            </li>
            <li>
              <strong>threads_content_publish</strong>: Mempublikasikan postingan teks dan rangkaian thread yang telah dijadwalkan oleh Owner.
            </li>
            <li>
              <strong>threads_manage_insights</strong>: Mengambil metrik engagement (Likes, Replies, Views) dari postingan yang diterbitkan.
            </li>
            <li>
              <strong>threads_read_replies</strong>: Membaca jumlah balasan untuk keperluan analisis performa dashboard.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            2. Keamanan dan Penyimpanan Data
          </h2>
          <p>
            Semua token akses (access token) dari Meta Threads dienkripsi menggunakan
            standar industri AES-256-GCM sebelum disimpan di basis data terproteksi.
            Kunci enkripsi disimpan terpisah pada variabel lingkungan server dan tidak
            pernah diekspos ke sisi klien.
          </p>
          <p>
            Data riwayat metrik hanya digunakan untuk menampilkan visualisasi grafik
            di dalam akun pribadi Owner dan tidak pernah dijual, dibagikan, atau dipindahtangankan
            kepada pihak ketiga mana pun.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            3. Penghapusan Data dan Pemutusan Akses
          </h2>
          <p>
            Pengguna dapat memutuskan koneksi akun Threads kapan saja melalui menu 
            <strong> Pengaturan</strong> di dalam aplikasi. Begitu tombol putuskan koneksi
            ditekan, seluruh token akses terkait akan langsung dihapus secara permanen dari server kami.
          </p>
          <p>
            Sesuai kebijakan Meta Platform, kami menyediakan endpoint kepatuhan otomatis:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Deauthorize Callback URL</strong>: Dipanggil oleh Meta ketika izin aplikasi dicabut.
            </li>
            <li>
              <strong>Data Deletion Request Callback</strong>: Memproses permintaan penghapusan data pengguna dan memberikan kode konfirmasi status pelacakan.
            </li>
          </ul>
          <p>
            Permintaan penghapusan data manual juga dapat diajukan secara langsung dengan
            menghubungi email kontak pengembang di <code>andra@example.com</code>.
          </p>
        </section>
      </div>
    </div>
  );
}


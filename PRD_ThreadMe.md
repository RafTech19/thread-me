# ThreadMe

---

## 1. Ringkasan & Tujuan Aplikasi

*Bagian ini menjelaskan gambaran umum proyek agar dipahami bersama oleh pemilik ide dan tim pengembang.*

- **Nama Aplikasi**: ThreadMe
- **Penjelasan Singkat**: ThreadMe adalah web app pribadi untuk membuat, menjadwalkan, dan mengunggah postingan ke akun Threads secara otomatis dengan bantuan AI Gemini. Aplikasi ini dilengkapi dashboard metrik (Likes & Replies) dan pemantauan pemakaian AI. Nilai pembedanya: satu tempat untuk menulis topik, menghasilkan konten, mengantrekannya di kalender, lalu melihat postingan mana yang paling menaikkan engagement.
- **Masalah yang Diselesaikan**:
  - Membuat konten Threads setiap hari memakan waktu dan sering tidak konsisten.
  - Sulit menjaga jadwal unggah yang teratur, sehingga engagement akun naik-turun.
  - Menulis rangkaian thread (beberapa post bersambung) yang menarik butuh ide dan struktur yang baik.
  - Tidak ada gambaran jelas postingan mana yang mendapat Likes dan Replies terbanyak.
  - Pemakaian AI Gemini tidak terpantau, sehingga kuota dan biaya sulit dikontrol.
  - Kegagalan unggah sering baru diketahui terlambat.
- **Pengguna Aplikasi**:
  - **Owner (Anda, satu-satunya pengguna)**: login dengan Google, mengelola seluruh fitur.
    - Menulis topik dan menghasilkan konten dengan Gemini.
    - Mengatur antrian konten di kalender.
    - Mengatur jadwal otomatis berkala.
    - Memantau metrik dan pemakaian AI.
    - Menerima notifikasi di dalam aplikasi.
  - **Pengunjung publik**: hanya bisa melihat halaman pembuka, halaman login, Kebijakan Privasi, dan Syarat Layanan (diwajibkan Meta untuk aplikasi yang terhubung ke Threads API).
- **Target Keberhasilan**:
  - Postingan terjadwal terunggah otomatis dengan tingkat keberhasilan minimal 95% (selisih waktu maksimal 2 menit dari jadwal).
  - Membuat satu thread berisi 5 post lengkap (dari topik sampai terjadwal) dalam kurang dari 2 menit.
  - Dashboard menampilkan Likes dan Replies per postingan dengan data diperbarui minimal setiap 1 jam.
  - Setiap panggilan Gemini tercatat di menu AI Usage, sehingga kuota harian tidak pernah terlewati tanpa peringatan.
  - Setiap postingan gagal unggah memunculkan notifikasi In-App dalam 1 menit.

---

## 2. Batasan Pembuatan Sistem (Versi Awal MVP)

*Menegaskan fitur apa yang dikerjakan di versi awal dan apa yang sengaja ditunda agar aplikasi cepat selesai dan tidak membengkak.*

### ✅ Yang Dikerjakan:

- Login Google OAuth satu klik, dibatasi hanya untuk satu email owner (allowlist).
- Koneksi akun Threads via OAuth resmi Meta (token disimpan terenkripsi dan diperpanjang otomatis).
- **Thread Generator** berbasis Gemini: input topik, nada, bahasa, dan jumlah post, lalu hasil dapat diedit per post.
- **Antrian Konten Berkala (Calendar)**: tampilan kalender bulan/minggu, drag and drop jadwal, dan daftar antrian.
- **Jadwal Otomatis Berkala (Automation)**: aturan "topik X, unggah setiap N jam, pada jam operasional tertentu", dengan mode langsung terbit atau tinjau dulu.
- Mesin publikasi otomatis (cron) ke Threads untuk post tunggal dan thread bersambung (rantai balasan).
- **Dashboard Metrics**: Likes dan Replies per postingan, tren, dan postingan terbaik.
- **Menu AI Usage**: log pemakaian Gemini (jumlah request, token, estimasi biaya, latensi, status) dan batas kuota harian.
- Notifikasi In-App (ikon lonceng dan halaman notifikasi) untuk sukses, gagal, token hampir kedaluwarsa, dan kuota AI.
- Halaman Pengaturan (koneksi Threads, zona waktu, brand voice, kuota, mode tinjau).
- UI modern, responsif, mode terang dan gelap.

### ⛔ Yang Tidak Dikerjakan di Versi Awal:

- Multi-pengguna, multi-akun Threads, dan sistem tim atau role lain.
- Posting gambar, video, dan carousel (MVP hanya teks, maksimal 500 karakter per post).
- Notifikasi via Email, WhatsApp, atau Telegram (hanya In-App).
- Metrik lanjutan (views, reposts, quotes ditampilkan di UI). Kolomnya disimpan di database untuk pengembangan berikutnya, tetapi UI MVP fokus pada Likes dan Replies.
- Auto-reply atau moderasi balasan.
- Pembayaran, langganan, dan payment gateway (aplikasi pribadi, tidak ada transaksi).
- Aplikasi mobile native.

---

## 3. Daftar Halaman & Struktur Menu (Pages & Routing)

*Daftar lengkap halaman yang harus dibuat, dikelompokkan berdasarkan area.*

### A. Public Area (Tanpa Login)

- `/` (Beranda): landing page ringkas berisi hero, penjelasan 4 fitur utama (Generator, Kalender, Dashboard, AI Usage), cuplikan UI, dan tombol "Masuk dengan Google".
- `/login` (Masuk): kartu login dengan tombol Google OAuth. Menampilkan pesan jelas jika email bukan milik owner ("Akun ini tidak memiliki akses").
- `/privacy` (Kebijakan Privasi): penjelasan data yang diakses (profil Threads, postingan, insights) dan cara penyimpanannya. Wajib untuk Meta App Review.
- `/terms` (Syarat Layanan): ketentuan penggunaan aplikasi pribadi.

### B. Owner Area (Setelah Login)

- `/dashboard` (Dasbor Metrics): kartu ringkasan (total Likes, total Replies, rata-rata per post, jumlah post terbit), grafik tren Likes dan Replies, tabel performa per postingan, postingan terbaik, dan ringkasan antrian terdekat.
- `/generator` (Thread Generator): form topik, nada, bahasa, jumlah post, mode engagement (hook dan CTA), tombol "Generate dengan Gemini", editor hasil per post dengan penghitung karakter, aksi "Simpan Draft", "Jadwalkan", "Posting Sekarang", dan "Regenerate" per bagian.
- `/queue` (Antrian Konten & Kalender): tampilan kalender (bulan/minggu) dengan chip postingan berwarna sesuai status, drag and drop untuk ubah jadwal, panel samping daftar antrian, dan tombol "Tambah Postingan".
- `/posts` (Semua Postingan): tabel semua postingan dengan filter status (draft, scheduled, published, failed), pencarian, dan aksi cepat.
- `/posts/[id]` (Detail Postingan): isi lengkap (termasuk bagian thread), status, riwayat error, grafik snapshot Likes dan Replies, tombol edit, jadwal ulang, coba lagi, dan batalkan.
- `/automation` (Jadwal Otomatis): daftar aturan otomatis (topik, interval, jam operasional, mode), toggle aktif/nonaktif, dan modal buat/edit aturan dengan pratinjau jadwal berikutnya.
- `/ai-usage` (AI Usage): kartu kuota harian (terpakai/batas), total token, estimasi biaya, grafik pemakaian per hari, rincian per fitur, dan tabel log request (waktu, fitur, model, token, latensi, status).
- `/notifications` (Notifikasi): daftar semua notifikasi In-App dengan filter belum dibaca, tombol tandai semua dibaca, dan tautan ke postingan terkait.
- `/settings` (Pengaturan): koneksi akun Threads (hubungkan, putuskan, status token), zona waktu, brand voice dan gaya bahasa default, batas kuota AI harian, batas maksimal posting per hari, dan toggle "Tinjau dulu sebelum terbit".

---

## 4. Pedoman UI/UX & Design System

*Panduan visual konkret agar AI coding assistant tidak membuat UI yang kaku atau default. Mengikuti Standard Eduwebmu Design.*

- **Skema Warna** (token CSS variable, format HSL):
  - Primary (Indigo-Biru): `HSL(231, 80%, 58%)`, hover `HSL(231, 80%, 52%)`.
  - Primary Soft (latar badge/aktif): `HSL(226, 100%, 96%)`.
  - Secondary: `HSL(214, 95%, 93%)`.
  - Background: `HSL(0, 0%, 100%)`, Muted Background: `HSL(220, 20%, 97%)`.
  - Foreground: `HSL(224, 30%, 12%)`, Muted Foreground: `HSL(220, 9%, 46%)`, Border: `HSL(220, 14%, 91%)`.
  - Success: `HSL(152, 60%, 40%)`, Warning: `HSL(38, 92%, 50%)`, Destructive: `HSL(0, 72%, 51%)`.
  - Mode gelap: Background `HSL(224, 30%, 8%)`, Card `HSL(224, 28%, 11%)`, Primary `HSL(231, 85%, 66%)`.
  - Warna status postingan: Draft (abu-abu), Scheduled (biru), Publishing (ungu), Published (hijau), Failed (merah), Cancelled (abu gelap).
- **Tipografi**: Heading memakai `Plus Jakarta Sans` (weight 600-800), Body memakai `Inter` (weight 400-500), angka metrik memakai `tabular-nums`. Skala: H1 `text-3xl`, H2 `text-xl`, body `text-sm`.
- **Aturan Komponen**:
  - Library: shadcn/ui, ikon Lucide.
  - Kartu: `rounded-xl`, `border`, `shadow-sm`, hover `shadow-md` dengan transisi 200ms.
  - Tombol: `rounded-lg`, primary solid indigo, secondary outline, destructive merah.
  - Input: tinggi 40px, fokus dengan ring primary 2px.
  - Badge status: pil kecil `rounded-full` dengan titik warna.
  - Tabel: header `bg-muted`, baris hover lembut, paginasi di bawah.
  - Grafik: Recharts (via komponen chart shadcn), Likes berwarna indigo dan Replies berwarna cyan/teal.
  - Layout dashboard: Sidebar kiri fixed (lebar 256px, collapse ke ikon di tablet, drawer di mobile), header atas berisi pencarian, toggle tema, lonceng notifikasi (dengan badge angka), dan menu profil.
  - Wajib ada empty state ber-ilustrasi ikon, skeleton loading, dan toast (Sonner) untuk setiap aksi.
- **Nuansa & Vibe**: Clean, modern, lega (banyak whitespace), terasa seperti tools produktivitas profesional. Micro-animations halus (fade-in kartu, transisi hover, animasi angka naik di kartu metrik, shimmer saat Gemini sedang generate). Responsif sempurna dari 360px sampai desktop lebar.

---

## 5. Pembagian Hak Akses Pengguna

*Aplikasi ini hanya dipakai oleh satu orang (Owner). Akses dibatasi dengan allowlist email Google (`OWNER_EMAIL`). Login dengan akun Google lain otomatis ditolak.*

| Menu / Halaman | Publik (Tanpa Login) | Owner (Login Google) |
| :--- | :---: | :---: |
| `/` Beranda | ✅ | ✅ |
| `/login` | ✅ | ✅ (diarahkan ke dashboard) |
| `/privacy` dan `/terms` | ✅ | ✅ |
| `/dashboard` | ❌ | ✅ |
| `/generator` | ❌ | ✅ |
| `/queue` | ❌ | ✅ |
| `/posts` dan `/posts/[id]` | ❌ | ✅ |
| `/automation` | ❌ | ✅ |
| `/ai-usage` | ❌ | ✅ |
| `/notifications` | ❌ | ✅ |
| `/settings` | ❌ | ✅ |
| `/api/cron/*` | ❌ (hanya dengan `CRON_SECRET`) | ❌ (hanya dengan `CRON_SECRET`) |

---

## 6. Alur Kerja dan Fitur Utama

*Cara kerja setiap fitur utama dalam bahasa yang mudah dipahami, beserta aturan logikanya.*

### A. Login Google & Pembatasan Akses

1. **Cara Kerja**: Anda membuka `/login`, menekan "Masuk dengan Google", memilih akun, lalu langsung masuk ke `/dashboard`.
2. **Aturan Sistem**:
   - Hanya email yang sama dengan `OWNER_EMAIL` yang diizinkan. Email lain ditolak di callback `signIn` dan diarahkan ke `/login?error=AccessDenied`.
   - Semua rute selain Public Area dilindungi middleware. Tanpa sesi, pengguna diarahkan ke `/login`.
   - Sesi memakai JWT dengan masa berlaku 30 hari.

### B. Koneksi Akun Threads

1. **Cara Kerja**: Di `/settings`, tekan "Hubungkan Akun Threads". Anda diarahkan ke halaman otorisasi Meta, menyetujui izin, lalu kembali ke aplikasi dengan status "Terhubung sebagai @username".
2. **Aturan Sistem**:
   - Izin (scope) yang diminta: `threads_basic`, `threads_content_publish`, `threads_manage_insights`, `threads_read_replies`.
   - Alur token: kode otorisasi ditukar menjadi short-lived token, lalu menjadi long-lived token (berlaku 60 hari). Token disimpan terenkripsi AES-256-GCM (`accessTokenEnc`).
   - Cron harian memperpanjang token (`th_refresh_token`) jika sisa masa berlaku kurang dari 10 hari. Jika gagal, dibuat notifikasi "Token Threads perlu dihubungkan ulang" dan semua publikasi dijeda.
   - Parameter `state` acak wajib divalidasi untuk mencegah CSRF pada OAuth.
   - Tombol "Putuskan Koneksi" menghapus token dari database.

### C. Thread Generator (Gemini)

1. **Cara Kerja**:
   1. Buka `/generator`, lalu isi topik (contoh: "Tips produktif kerja remote").
   2. Pilih format (Post Tunggal atau Thread), jumlah post (2-10), nada (santai, edukatif, provokatif-ringan, storytelling), dan bahasa.
   3. Aktifkan "Mode Engagement" agar Gemini menulis hook kuat di post pertama dan pertanyaan pemancing Replies di post terakhir.
   4. Tekan "Generate". Muncul kartu-kartu post yang bisa diedit, dengan penghitung karakter dan tombol "Regenerate bagian ini".
   5. Pilih aksi: Simpan Draft, Jadwalkan (pilih tanggal dan jam), atau Posting Sekarang.
2. **Aturan Sistem**:
   - Model default `gemini-2.5-flash` (bisa diganti via `GEMINI_MODEL`). Output wajib JSON terstruktur (`responseMimeType: application/json` dengan schema) berisi array `posts[]`.
   - Setiap post maksimal 500 karakter. Jika hasil Gemini melebihi batas, server memotong dan meminta regenerasi otomatis satu kali.
   - Brand voice dari `/settings` disisipkan otomatis ke system prompt.
   - Sebelum memanggil Gemini, server mengecek kuota harian (`aiDailyRequestLimit`). Jika habis, tampilkan pesan jelas dan catat sebagai `rate_limited`.
   - Setiap panggilan (sukses atau gagal) dicatat ke `ai_usage_logs`.
   - Thread yang disimpan menjadi satu baris `posts` (type `thread`) dengan beberapa baris `post_items` berurutan.

### D. Antrian Konten Berkala (Calendar)

1. **Cara Kerja**: Di `/queue`, Anda melihat kalender berisi seluruh postingan terjadwal. Klik tanggal untuk menambah postingan baru, klik chip untuk melihat atau mengedit, dan seret chip ke tanggal atau jam lain untuk menjadwal ulang.
2. **Aturan Sistem**:
   - Jadwal tidak boleh di masa lalu (minimal 2 menit dari sekarang).
   - Hanya postingan berstatus `draft` atau `scheduled` yang bisa diseret dan diedit.
   - Peringatan jika lebih dari `maxPostsPerDay` postingan dijadwalkan pada satu hari (default 10, demi menjaga akun dari kesan spam).
   - Semua jam ditampilkan dalam zona waktu pengaturan (default `Asia/Jakarta`), sedangkan database menyimpan UTC.
   - Postingan dari Jadwal Otomatis ditandai ikon petir di kalender.

### E. Jadwal Otomatis Berkala (Automation)

1. **Cara Kerja**: Di `/automation`, buat aturan, misalnya: topik "Karier developer pemula", format post tunggal, setiap 6 jam, jam operasional 08:00-21:00, Senin-Minggu, mode "Tinjau dulu". Sistem lalu menghasilkan dan menjadwalkan konten secara otomatis sesuai interval.
2. **Aturan Sistem**:
   - Field aturan: nama, topik, instruksi tambahan, nada, bahasa, format (single/thread), jumlah post thread, `intervalMinutes` (minimal 60), jam mulai dan selesai, hari aktif, mode, dan status aktif.
   - Mode `auto_publish`: hasil Gemini langsung berstatus `scheduled`. Mode `review_first`: berstatus `draft` dan memunculkan notifikasi untuk ditinjau.
   - `nextRunAt` dihitung ulang setelah setiap eksekusi dan selalu jatuh di dalam jam operasional dan hari aktif.
   - Untuk menghindari konten berulang, 10 postingan terakhir pada aturan yang sama dikirim ke Gemini sebagai daftar "jangan ulangi".
   - Jika kuota AI habis atau Gemini gagal, aturan dilewati satu siklus dan notifikasi dibuat.

### F. Mesin Publikasi Otomatis (Publishing Engine)

1. **Cara Kerja**: Cron eksternal memanggil `/api/cron/tick` setiap menit. Sistem mengambil postingan `scheduled` yang waktunya sudah tiba, lalu mengunggahnya ke Threads.
2. **Aturan Sistem**:
   - Endpoint wajib memeriksa header `Authorization: Bearer CRON_SECRET`.
   - Pengambilan antrian memakai `SELECT ... FOR UPDATE SKIP LOCKED`, lalu status diubah ke `publishing` agar tidak terunggah ganda.
   - Alur Threads API per post: (1) `POST /{threads-user-id}/threads` dengan `media_type=TEXT` dan `text`, mendapatkan `creation_id`, (2) tunggu sekitar 5-30 detik sesuai rekomendasi Meta, (3) `POST /{threads-user-id}/threads_publish` dengan `creation_id`, mendapatkan `media_id`, (4) ambil `permalink`.
   - Untuk thread: post pertama dipublikasikan seperti di atas, lalu post berikutnya dibuat dengan parameter `reply_to_id` = `media_id` post sebelumnya, secara berurutan.
   - Jika gagal: `retryCount` bertambah dan dicoba ulang maksimal 3 kali (jeda 2, 5, 10 menit). Setelah itu status `failed`, `errorMessage` disimpan, dan notifikasi In-App dibuat.
   - Jika thread gagal di tengah jalan, bagian yang sudah terbit tetap tercatat (`post_items.status`) dan percobaan ulang melanjutkan dari bagian yang belum terbit.
   - Batas Threads API (sekitar 250 postingan per 24 jam) dihormati lewat `maxPostsPerDay`.
   - Jika koneksi Threads tidak aktif, post tidak diproses dan notifikasi dibuat sekali per jam.

### G. Dashboard Metrics (Likes & Replies)

1. **Cara Kerja**: `/dashboard` menampilkan ringkasan performa. Anda dapat memilih rentang waktu (7 hari, 30 hari, 90 hari), melihat grafik tren, dan menelusuri tabel postingan yang diurutkan berdasarkan Likes atau Replies.
2. **Aturan Sistem**:
   - Cron `/api/cron/metrics` berjalan tiap jam. Ia mengambil insights (`GET /{media-id}/insights?metric=likes,replies,views,reposts,quotes`) untuk postingan terbit dalam 7 hari terakhir. Postingan yang lebih lama diperbarui sekali sehari.
   - Setiap pengambilan disimpan sebagai snapshot di `post_metrics`, sehingga tren per postingan bisa digambar.
   - Kartu ringkasan: total Likes, total Replies, rata-rata Likes/post, rata-rata Replies/post, jumlah post terbit. Dilengkapi persentase perubahan terhadap periode sebelumnya.
   - Untuk post berformat thread, metrik dihitung dari seluruh bagian dan ditampilkan sebagai total.
   - Tombol "Sinkronkan Sekarang" memicu pengambilan manual (dibatasi 1 kali per 5 menit).
   - Insight tambahan sederhana: "Jam terbaik posting" berdasarkan rata-rata Likes+Replies per jam terbit.

### H. Menu AI Usage

1. **Cara Kerja**: `/ai-usage` menampilkan seberapa banyak Gemini terpakai: kartu kuota harian, grafik token per hari, rincian per fitur (Thread Generator, Jadwal Otomatis, Regenerate), dan tabel log request.
2. **Aturan Sistem**:
   - Setiap panggilan Gemini menulis satu baris `ai_usage_logs` dengan token dari `usageMetadata` (prompt, completion, total), latensi, status, dan pesan error.
   - Estimasi biaya dihitung dari tarif per 1 juta token yang disimpan di konfigurasi (`lib/ai/pricing.ts`) dan ditampilkan sebagai perkiraan, bukan tagihan resmi.
   - Kuota harian dihitung per hari menurut zona waktu pengaturan. Pada 80% pemakaian muncul notifikasi peringatan, dan pada 100% semua generate diblokir sampai hari berikutnya.
   - Filter rentang waktu, fitur, dan status. Ada tombol ekspor CSV log.

### I. Notifikasi In-App

1. **Cara Kerja**: Ikon lonceng di header menampilkan jumlah notifikasi belum dibaca. Klik untuk melihat 5 terbaru, atau buka `/notifications` untuk daftar lengkap.
2. **Aturan Sistem**:
   - Jenis: `post_published`, `post_failed`, `draft_ready` (hasil automation menunggu tinjauan), `token_expiring`, `token_invalid`, `ai_quota_warning`, `ai_quota_exhausted`.
   - Notifikasi memiliki tautan ke postingan atau halaman terkait.
   - Pembaruan memakai polling ringan setiap 30 detik (tanpa kebutuhan WebSocket).
   - Notifikasi lebih dari 90 hari dibersihkan otomatis oleh cron harian.

### J. Pengaturan

1. **Cara Kerja**: Di `/settings`, Anda mengubah zona waktu, brand voice, bahasa default, batas kuota AI, batas posting per hari, dan toggle "Tinjau dulu sebelum terbit" yang menjadi default aturan otomatis baru.
2. **Aturan Sistem**:
   - Validasi dengan Zod. Brand voice maksimal 1000 karakter.
   - Perubahan zona waktu hanya memengaruhi tampilan dan perhitungan jam operasional, bukan jadwal yang tersimpan (UTC).

---

## 7. Alur Navigasi & Arsitektur Layout

*Peta navigasi alur halaman dan struktur tata letak (layout).*

### Arsitektur Layout (Persisten)

- **Public Layout**: Header (navbar statis di atas dengan logo ThreadMe dan tombol Masuk) dan Footer (tautan Privasi dan Syarat).
- **Dashboard Layout**: Sidebar kiri fixed dengan menu Dashboard, Thread Generator, Antrian (Kalender), Semua Postingan, Jadwal Otomatis, AI Usage, Notifikasi, dan Pengaturan. Header kecil di atas berisi toggle tema, lonceng notifikasi, dan menu profil. Pada mobile sidebar menjadi drawer.
- **Indikator Status Global**: di bawah sidebar terdapat kartu kecil "Threads: Terhubung (@username)" dan "Kuota AI: 12/50".

### Bagan Alur (Flowchart)
```mermaid
flowchart TD
    A[Pengunjung] --> B[Beranda]
    B --> C[Halaman Login]
    C --> D{Email = OWNER_EMAIL?}
    D -- Tidak --> E[Akses Ditolak]
    D -- Ya --> F[Dashboard]
    F --> G{Threads sudah terhubung?}
    G -- Belum --> H[Pengaturan: Hubungkan Threads]
    H --> F
    G -- Sudah --> I[Menu Utama]
    I --> J[Thread Generator]
    I --> K[Antrian Kalender]
    I --> L[Jadwal Otomatis]
    I --> M[AI Usage]
    I --> N[Notifikasi]
    I --> O[Semua Postingan]
    J --> P{Aksi hasil generate}
    P -- Draft --> O
    P -- Jadwalkan --> K
    P -- Posting Sekarang --> Q[Mesin Publikasi]
    L --> R[Cron membuat konten via Gemini]
    R --> S{Mode aturan}
    S -- Tinjau dulu --> T[Draft + Notifikasi]
    S -- Auto publish --> K
    T --> K
    K --> Q
    O --> U[Detail Postingan]
```
```mermaid
flowchart TD
    A[Cron eksternal tiap menit] --> B[POST api cron tick dengan CRON_SECRET]
    B --> C{Secret valid?}
    C -- Tidak --> D[401 Unauthorized]
    C -- Ya --> E[Proses Jadwal Otomatis jatuh tempo]
    E --> F[Panggil Gemini + catat ai_usage_logs]
    F --> G[Buat post draft atau scheduled]
    C -- Ya --> H[Ambil posts scheduled jatuh tempo]
    H --> I[Status menjadi publishing]
    I --> J[Threads: create container]
    J --> K[Tunggu lalu threads_publish]
    K --> L{Berhasil?}
    L -- Ya --> M[Status published + simpan media_id dan permalink]
    M --> N[Notifikasi post_published]
    L -- Tidak --> O{retryCount kurang dari 3?}
    O -- Ya --> P[Jadwalkan ulang beberapa menit lagi]
    O -- Tidak --> Q[Status failed + notifikasi post_failed]
```
```mermaid
flowchart TD
    A[Cron metrics tiap jam] --> B[Ambil posts published 7 hari terakhir]
    B --> C[GET insights likes dan replies per media_id]
    C --> D[Simpan snapshot ke post_metrics]
    D --> E[Dashboard membaca snapshot terbaru dan tren]
```

---

## 8. Kebutuhan Non-Fungsional (SEO, Keamanan, & Performa)

*Syarat wajib agar website siap rilis ke publik (production-ready).*

- **SEO**:
  - Halaman publik (`/`, `/login`, `/privacy`, `/terms`) wajib memakai `generateMetadata` dengan `<title>` dinamis, meta description, dan Open Graph tags (judul, deskripsi, gambar OG).
  - Seluruh halaman Owner Area wajib `robots: noindex, nofollow`.
  - Sediakan `sitemap.xml` dan `robots.txt` (hanya mengizinkan halaman publik).
- **Keamanan**:
  - Proteksi CSRF (bawaan Server Actions dan validasi `state` OAuth), sanitasi input untuk mencegah XSS, dan validasi sisi server dengan Zod pada setiap Server Action dan Route Handler.
  - Semua Server Action dan API (kecuali cron) wajib memanggil `requireOwner()` yang memverifikasi sesi dan email owner.
  - Endpoint cron wajib `Authorization: Bearer CRON_SECRET` dengan perbandingan waktu-konstan (`timingSafeEqual`).
  - Token Threads terenkripsi AES-256-GCM dengan `ENCRYPTION_KEY`. Token dan API key tidak boleh pernah masuk ke client bundle atau log.
  - Rate limiting pada endpoint generate (maksimal 10 request per menit) dan tombol sinkron manual.
  - Security headers (CSP, `X-Frame-Options`, `Referrer-Policy`) di `next.config.ts`.
  - Halaman `/privacy` mencantumkan cara menghapus data. Sediakan endpoint Data Deletion Callback dan Deauthorize Callback sesuai persyaratan Meta.
- **Performa**:
  - Optimasi gambar dengan `<Image>`, lazy loading komponen berat (grafik Recharts dan kalender dimuat dengan `dynamic import`), dan caching data publik.
  - Query dashboard memakai index (`posts(status, scheduled_at)`, `post_metrics(post_id, fetched_at)`) dan agregasi di sisi database.
  - Panggilan Threads dan Gemini memakai timeout (15 dan 30 detik) serta penanganan error yang rapi.
  - Target Lighthouse Performance minimal 90 untuk halaman publik.

---

## 9. Panduan Bahasa, Copywriting, & Data Dummy

*Panduan nada bicara dan contoh data agar prototipe terasa nyata.*

- **Gaya Bahasa**: Profesional, ramah, dan membumi. UI memakai sapaan "Anda". Label singkat dan jelas (contoh: "Jadwalkan", "Posting Sekarang", "Tinjau Dulu"). Pesan error informatif dan solutif (contoh: "Kuota AI hari ini sudah habis. Akan aktif lagi besok pukul 00:00 WIB."). Konten yang dihasilkan Gemini berbahasa Indonesia santai dan natural, bukan kaku.
- **Instruksi Data Dummy**: JANGAN PERNAH MENGGUNAKAN "Lorem Ipsum". Selalu gunakan data dummy berbahasa Indonesia yang relevan.
  - **Akun**: `@andra.berkarya` (nama tampil "Andra Pratama"), email owner `andra@example.com`.
  - **Postingan tunggal**:
    - "Kerja remote itu bukan soal kerja dari rumah, tapi soal kerja dengan batasan yang jelas. Kamu sendiri, paling susah memisahkan jam kerja atau jam istirahat?"
    - "3 kebiasaan kecil yang bikin developer pemula cepat naik level: baca kode orang lain, tulis catatan belajar, dan berani bertanya. Mana yang paling sering kamu skip?"
  - **Thread 5 post**: "Cara mengatur gaji bulanan biar tidak habis di tanggal 20 🧵" (1/5 hook, 2/5 pos kebutuhan, 3/5 tabungan, 4/5 hiburan, 5/5 pertanyaan penutup).
  - **Topik aturan otomatis**: "Produktivitas kerja remote", "Karier developer pemula", "Keuangan pribadi untuk anak muda".
  - **Metrik**: Likes 12-480 dan Replies 1-65 per post. Post terbaik: 482 Likes dan 67 Replies.
  - **AI Usage**: 27 dari 50 request hari ini, 41.230 token, estimasi biaya US$0,012, latensi 1,2-4,8 detik, satu log berstatus error ("503 model overloaded").
  - **Notifikasi**: "Postingan 'Tips produktif kerja remote' berhasil terbit pukul 09.00 WIB", "Postingan gagal terbit: token Threads kedaluwarsa", "Draft baru dari aturan 'Karier developer pemula' siap ditinjau".

---

## 10. Fondasi Teknis (Untuk Tim Pengembang / Programmer & AI)

*Petunjuk arsitektur teknis spesifik. Stack direkomendasikan karena paling optimal untuk aplikasi pribadi satu pengguna: satu codebase fullstack, biaya hosting rendah, dan mudah dikembangkan oleh AI coding assistant.*

- **Bahasa & Framework**: Next.js 15 (App Router) dengan TypeScript, Server Actions untuk mutasi, Route Handlers untuk cron dan OAuth callback, validasi Zod.
- **Tampilan Antarmuka (UI)**: Tailwind CSS, shadcn/ui, Lucide Icons, Recharts (grafik), FullCalendar atau `react-big-calendar` (kalender dengan drag and drop), Sonner (toast), `next-themes` (mode gelap).
- **Autentikasi**: Auth.js v5 (NextAuth) dengan provider Google OAuth, sesi JWT, dan allowlist `OWNER_EMAIL`. Akses Threads memakai alur OAuth terpisah (Meta Threads API) yang disimpan di `threads_connections`.
- **Basis Data (Database)**: Neon PostgreSQL dengan Drizzle ORM dan Drizzle Kit untuk migrasi.
- **AI**: Google Gemini lewat SDK `@google/genai` (model default `gemini-2.5-flash`, output JSON terstruktur).
- **Penjadwalan (Cron)**: Endpoint `/api/cron/*` dipanggil oleh cron eksternal (cron-job.org gratis, Upstash QStash, atau Vercel Cron pada plan Pro) setiap menit untuk `tick`, setiap jam untuk `metrics`, dan setiap hari untuk `maintenance` (refresh token dan pembersihan notifikasi).
- **Hosting**: Vercel (aplikasi) dan Neon (database). Alternatif: VPS dengan Docker.
- **Catatan Meta**: Buat aplikasi di Meta for Developers dengan produk "Threads API". Karena aplikasi dipakai pribadi, akun Threads Anda cukup didaftarkan sebagai Threads Tester sehingga App Review penuh tidak wajib untuk penggunaan sendiri. Tetap sediakan URL `/privacy`, `/terms`, dan callback penghapusan data.

### Struktur Skema Database Nyata
```typescript
// src/db/schema.ts
import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  numeric,
  index,
} from "drizzle-orm/pg-core";

// ---------- ENUMS ----------
export const postStatus = pgEnum("post_status", [
  "draft",
  "scheduled",
  "publishing",
  "published",
  "failed",
  "cancelled",
]);
export const postType = pgEnum("post_type", ["single", "thread"]);
export const postSource = pgEnum("post_source", ["manual", "generator", "automation"]);
export const scheduleMode = pgEnum("schedule_mode", ["auto_publish", "review_first"]);
export const connectionStatus = pgEnum("connection_status", ["active", "expired", "revoked"]);
export const notificationType = pgEnum("notification_type", [
  "post_published",
  "post_failed",
  "draft_ready",
  "token_expiring",
  "token_invalid",
  "ai_quota_warning",
  "ai_quota_exhausted",
]);
export const aiFeature = pgEnum("ai_feature", [
  "thread_generator",
  "auto_schedule",
  "regenerate_part",
]);
export const aiStatus = pgEnum("ai_status", ["success", "error", "rate_limited"]);

// ---------- APP SETTINGS (single row, id = 1) ----------
export const appSettings = pgTable("app_settings", {
  id: integer("id").primaryKey().default(1),
  ownerEmail: varchar("owner_email", { length: 255 }).notNull(),
  timezone: varchar("timezone", { length: 64 }).notNull().default("Asia/Jakarta"),
  brandVoice: text("brand_voice").default(""),
  defaultLanguage: varchar("default_language", { length: 8 }).notNull().default("id"),
  aiDailyRequestLimit: integer("ai_daily_request_limit").notNull().default(50),
  maxPostsPerDay: integer("max_posts_per_day").notNull().default(10),
  reviewBeforePublish: boolean("review_before_publish").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- THREADS CONNECTION ----------
export const threadsConnections = pgTable("threads_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  threadsUserId: varchar("threads_user_id", { length: 64 }).notNull().unique(),
  username: varchar("username", { length: 100 }).notNull(),
  profilePictureUrl: text("profile_picture_url"),
  accessTokenEnc: text("access_token_enc").notNull(), // AES-256-GCM (iv:tag:ciphertext)
  scopes: text("scopes").notNull(),
  status: connectionStatus("status").notNull().default("active"),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }).notNull(),
  lastRefreshedAt: timestamp("last_refreshed_at", { withTimezone: true }),
  connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- AI USAGE LOGS ----------
export const aiUsageLogs = pgTable(
  "ai_usage_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    feature: aiFeature("feature").notNull(),
    model: varchar("model", { length: 64 }).notNull(),
    promptTokens: integer("prompt_tokens").notNull().default(0),
    completionTokens: integer("completion_tokens").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),
    estimatedCostUsd: numeric("estimated_cost_usd", { precision: 10, scale: 6 })
      .notNull()
      .default("0"),
    latencyMs: integer("latency_ms").notNull().default(0),
    status: aiStatus("status").notNull(),
    errorMessage: text("error_message"),
    topic: varchar("topic", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_usage_created_idx").on(t.createdAt)],
);

// ---------- AUTO SCHEDULES (Jadwal Otomatis) ----------
export const autoSchedules = pgTable("auto_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  instructions: text("instructions").default(""),
  tone: varchar("tone", { length: 40 }).notNull().default("santai"),
  language: varchar("language", { length: 8 }).notNull().default("id"),
  format: postType("format").notNull().default("single"),
  threadLength: integer("thread_length").notNull().default(5),
  intervalMinutes: integer("interval_minutes").notNull().default(360), // minimal 60
  windowStart: varchar("window_start", { length: 5 }).notNull().default("08:00"),
  windowEnd: varchar("window_end", { length: 5 }).notNull().default("21:00"),
  activeDays: jsonb("active_days").$type<number[]>().notNull().default([0, 1, 2, 3, 4, 5, 6]),
  mode: scheduleMode("mode").notNull().default("review_first"),
  isActive: boolean("is_active").notNull().default(true),
  nextRunAt: timestamp("next_run_at", { withTimezone: true }),
  lastRunAt: timestamp("last_run_at", { withTimezone: true }),
  totalGenerated: integer("total_generated").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- POSTS ----------
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: postType("type").notNull().default("single"),
    source: postSource("source").notNull().default("manual"),
    topic: varchar("topic", { length: 255 }),
    status: postStatus("status").notNull().default("draft"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    threadsMediaId: varchar("threads_media_id", { length: 64 }), // media id post pertama
    permalink: text("permalink"),
    retryCount: integer("retry_count").notNull().default(0),
    nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    aiGenerated: boolean("ai_generated").notNull().default(false),
    autoScheduleId: uuid("auto_schedule_id").references(() => autoSchedules.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("posts_status_scheduled_idx").on(t.status, t.scheduledAt),
    index("posts_published_at_idx").on(t.publishedAt),
  ],
);

// ---------- POST ITEMS (bagian thread; post tunggal = 1 item) ----------
export const postItems = pgTable(
  "post_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    position: integer("position").notNull(), // mulai dari 1
    content: varchar("content", { length: 500 }).notNull(),
    threadsMediaId: varchar("threads_media_id", { length: 64 }),
    status: postStatus("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => [index("post_items_post_idx").on(t.postId, t.position)],
);

// ---------- POST METRICS (snapshot Likes & Replies) ----------
export const postMetrics = pgTable(
  "post_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    likes: integer("likes").notNull().default(0),
    replies: integer("replies").notNull().default(0),
    views: integer("views"), // disimpan untuk pengembangan lanjutan
    reposts: integer("reposts"),
    quotes: integer("quotes"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("post_metrics_post_fetched_idx").on(t.postId, t.fetchedAt)],
);

// ---------- NOTIFICATIONS ----------
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: notificationType("type").notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    message: text("message").notNull(),
    postId: uuid("post_id").references(() => posts.id, { onDelete: "set null" }),
    linkUrl: varchar("link_url", { length: 255 }),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notifications_read_created_idx").on(t.isRead, t.createdAt)],
);

// ---------- RELATIONS ----------
export const postsRelations = relations(posts, ({ many, one }) => ({
  items: many(postItems),
  metrics: many(postMetrics),
  autoSchedule: one(autoSchedules, {
    fields: [posts.autoScheduleId],
    references: [autoSchedules.id],
  }),
}));
export const postItemsRelations = relations(postItems, ({ one }) => ({
  post: one(posts, { fields: [postItems.postId], references: [posts.id] }),
}));
export const postMetricsRelations = relations(postMetrics, ({ one }) => ({
  post: one(posts, { fields: [postMetrics.postId], references: [posts.id] }),
}));
export const autoSchedulesRelations = relations(autoSchedules, ({ many }) => ({
  posts: many(posts),
}));
```

### Variabel Lingkungan (`.env.example`)
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Auth.js + Google OAuth
AUTH_SECRET=isi_dengan_openssl_rand_base64_32
AUTH_GOOGLE_ID=xxxxxxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=xxxxxxxx
OWNER_EMAIL=andra@example.com

# Google Gemini
GEMINI_API_KEY=xxxxxxxx
GEMINI_MODEL=gemini-2.5-flash

# Meta Threads API
THREADS_APP_ID=xxxxxxxx
THREADS_APP_SECRET=xxxxxxxx
THREADS_REDIRECT_URI=http://localhost:3000/api/threads/callback

# Keamanan
ENCRYPTION_KEY=isi_dengan_32_byte_hex_64_karakter
CRON_SECRET=isi_dengan_string_acak_panjang

# Batas default
AI_DAILY_REQUEST_LIMIT=50
```

---

## 11. Tahapan Pengerjaan & Task Breakdown (Actionable Work Breakdown Structure)

*Task dikelompokkan ke dalam 3 Milestone Fase. AI Coding Assistant menyelesaikan satu fase penuh dalam satu putaran, lalu berhenti dan menunggu konfirmasi sebelum fase berikutnya.*

### Tahap 1: Fondasi Proyek, UI/UX, & Semua Halaman (Dummy Data)

*Tujuan: Membangun seluruh antarmuka visual secara 100% lengkap dan responsif menggunakan data dummy (tanpa database) sebelum menyentuh backend. Tidak boleh ada halaman placeholder.*

- [ ] **Task 1.1 (Foundations & Design System)**: Inisialisasi Next.js 15 (TypeScript, App Router), setup Tailwind dan token warna HSL indigo-biru di `globals.css` (termasuk mode gelap via `next-themes`), font `Plus Jakarta Sans` dan `Inter` via `next/font`, Lucide Icons, Sonner, Recharts, dan install komponen shadcn/ui (Button, Card, Input, Textarea, Select, Dialog, Sheet, Table, Badge, Dropdown Menu, Tabs, Switch, Progress, Skeleton, Calendar, Popover, Tooltip). Buat komponen kustom `StatusBadge` (draft, scheduled, publishing, published, failed, cancelled), `StatCard`, `EmptyState`, dan `CharCounter`. Buat folder `src/lib/mock-data.ts` berisi data dummy Indonesia sesuai Bab 9 (posts, post_items, post_metrics, notifications, ai_usage_logs, auto_schedules).
- [ ] **Task 1.2 (Layouts & Persistent Navigation)**: Buat Root Layout, Public Layout (Header dengan logo ThreadMe dan tombol Masuk, Footer dengan tautan `/privacy` dan `/terms`), dan Dashboard Layout (grup rute `(app)`) dengan Sidebar persisten (menu: `/dashboard`, `/generator`, `/queue`, `/posts`, `/automation`, `/ai-usage`, `/notifications`, `/settings`), header atas (toggle tema, lonceng notifikasi dengan dropdown 5 terbaru dan badge belum dibaca, menu profil), kartu status Threads dan kuota AI di dasar sidebar, serta mobile drawer.
- [ ] **Task 1.3 (Public Pages)**: Buat halaman `/` (hero, 4 kartu fitur, cuplikan UI dashboard, CTA "Masuk dengan Google"), `/login` (kartu login Google dengan tampilan error `AccessDenied`), `/privacy`, dan `/terms` berisi konten nyata berbahasa Indonesia (data yang diakses, penyimpanan, cara hapus data).
- [ ] **Task 1.4 (Dashboard, Generator & Postingan Pages)**: Buat `/dashboard` (4 kartu metrik dengan perbandingan periode, filter 7/30/90 hari, grafik garis Likes vs Replies, kartu "Post Terbaik", "Jam Terbaik Posting", tabel performa per post yang bisa diurutkan, dan ringkasan 3 antrian terdekat), `/generator` (form lengkap, state loading shimmer simulasi Gemini, editor kartu per post dengan penghitung 500 karakter, tombol regenerate per bagian, dan aksi Simpan Draft, Jadwalkan via dialog tanggal-jam, serta Posting Sekarang), `/posts` (tabel dengan filter status, pencarian, dan aksi cepat), serta `/posts/[id]` (isi lengkap, bagian thread, riwayat error, grafik snapshot, aksi edit, jadwal ulang, coba lagi, dan batalkan).
- [ ] **Task 1.5 (Queue, Automation, AI Usage, Notifications & Settings Pages)**: Buat `/queue` (kalender bulan/minggu interaktif dengan chip berwarna status, drag and drop pada data dummy, dialog tambah/edit, panel daftar antrian, dan ikon petir untuk post otomatis), `/automation` (kartu aturan dengan toggle aktif, modal buat/edit berisi topik, interval, jam operasional, hari aktif, format, mode, dan pratinjau 3 jadwal berikutnya), `/ai-usage` (kartu kuota dengan Progress, total token, estimasi biaya, grafik token harian, rincian per fitur, tabel log dengan filter dan tombol ekspor CSV), `/notifications` (daftar, filter belum dibaca, tandai semua dibaca), dan `/settings` (kartu koneksi Threads dengan status token, zona waktu, brand voice, kuota AI, batas posting harian, dan toggle tinjau dulu). Pastikan seluruh halaman responsif dari 360px.

### Tahap 2: Database, Autentikasi, & Integrasi Data Dinamis

*Tujuan: Menghidupkan aplikasi dengan database nyata, autentikasi Google, Gemini, dan Server Actions.*

- [ ] **Task 2.1 (Database Schema & Migrations)**: Pasang Drizzle ORM dan Drizzle Kit dengan Neon (`@neondatabase/serverless`), buat `src/db/schema.ts` sesuai Bab 10 (tabel `app_settings`, `threads_connections`, `ai_usage_logs`, `auto_schedules`, `posts`, `post_items`, `post_metrics`, `notifications`), jalankan migrasi, dan buat script seed (`npm run db:seed`) yang mengisi `app_settings` dan data contoh Indonesia dari Bab 9.
- [ ] **Task 2.2 (Authentication & Route Middleware)**: Pasang Auth.js v5 dengan Google OAuth dan sesi JWT. Callback `signIn` hanya mengizinkan `OWNER_EMAIL`, buat `middleware.ts` yang melindungi seluruh rute Owner Area (`/dashboard`, `/generator`, `/queue`, `/posts`, `/automation`, `/ai-usage`, `/notifications`, `/settings`), helper `requireOwner()` untuk Server Actions, dan integrasikan tombol login dan logout pada `/login` dan menu profil.
- [ ] **Task 2.3 (Koneksi Threads, Gemini Service, & Server Actions)**: Implementasi (a) `/api/threads/connect` dan `/api/threads/callback` (OAuth dengan validasi `state`, tukar short-lived ke long-lived token, enkripsi AES-256-GCM, simpan ke `threads_connections`), (b) `src/lib/ai/gemini.ts` (`@google/genai`, output JSON terstruktur, pengecekan kuota harian, pencatatan ke `ai_usage_logs`, estimasi biaya di `lib/ai/pricing.ts`), (c) Server Actions CRUD dengan validasi Zod untuk `posts` dan `post_items` (buat, edit, jadwalkan, jadwalkan ulang, batalkan), `auto_schedules` (CRUD dan toggle), `notifications` (tandai dibaca), dan `app_settings` (simpan pengaturan), serta action `generateThread` untuk `/generator`.
- [ ] **Task 2.4 (Frontend Data Binding & Mutations)**: Hubungkan seluruh halaman Tahap 1 ke data nyata: `/dashboard` (agregasi `post_metrics`), `/generator` (aksi generate, regenerate bagian, simpan, jadwalkan), `/queue` (kalender membaca `posts`, drag and drop memanggil action jadwal ulang), `/posts` dan `/posts/[id]`, `/automation`, `/ai-usage` (agregasi `ai_usage_logs` dan ekspor CSV), `/notifications` (polling 30 detik pada lonceng), dan `/settings`. Ganti seluruh `mock-data.ts` dengan query database, dan sediakan loading, error, dan empty state.

### Tahap 3: Integrasi Pihak Ketiga, Keamanan, SEO, & Deployment

*Tujuan: Mengaktifkan mesin publikasi otomatis, sinkronisasi metrik, keamanan, SEO, dan rilis ke production.*

- [ ] **Task 3.1 (Publishing Engine, Cron Jobs & Metrics Sync)**: Buat `src/lib/threads/client.ts` (create container, publish, `reply_to_id` untuk thread, ambil permalink, insights likes dan replies, refresh token). Buat Route Handler `/api/cron/tick` (proses `auto_schedules` jatuh tempo ke Gemini lalu `posts`, serta publikasi `posts` berstatus `scheduled` dengan `FOR UPDATE SKIP LOCKED`, retry 3 kali, dan pembaruan `post_items`), `/api/cron/metrics` (snapshot ke `post_metrics` tiap jam), dan `/api/cron/maintenance` (refresh token, peringatan `token_expiring`, pembersihan notifikasi lama). Semua dilindungi `CRON_SECRET`. Buat notifikasi `post_published`, `post_failed`, `draft_ready`, `ai_quota_warning`, dan `ai_quota_exhausted`. Tambahkan tombol "Posting Sekarang" dan "Sinkronkan Sekarang" yang berfungsi.
- [ ] **Task 3.2 (Non-Functional Requirements & Security)**: Pasang `generateMetadata` dinamis (title, description, Open Graph) pada `/`, `/login`, `/privacy`, `/terms`, `noindex` pada Owner Area, `sitemap.xml` dan `robots.txt`, security headers di `next.config.ts`, rate limiting pada generate dan sinkron manual, sanitasi input XSS, validasi Zod menyeluruh, `timingSafeEqual` untuk cron secret, serta endpoint Deauthorize dan Data Deletion Callback Meta di `/api/threads/deauthorize` dan `/api/threads/delete`.
- [ ] **Task 3.3 (End-to-End Testing & Bugfix)**: Uji alur lengkap: login Google (email owner diterima dan email lain ditolak), hubungkan Threads, generate thread 5 post, jadwalkan, tunggu terbit otomatis (post tunggal dan thread bersambung), cek metrik Likes dan Replies di `/dashboard`, buat aturan di `/automation` mode `review_first` dan `auto_publish`, uji kegagalan (token tidak valid dan Gemini error) beserta notifikasinya, uji batas kuota di `/ai-usage`, dan uji zona waktu. Perbaiki bug, glitch responsif, dan optimalkan query.
- [ ] **Task 3.4 (Production Build & Deployment)**: Siapkan `.env.production`, jalankan `npm run build` hingga lulus tanpa error, deploy ke Vercel (atau VPS dengan Docker), jalankan migrasi database production, daftarkan Redirect URI Google dan Threads pada domain production, atur tiga cron eksternal (`tick` tiap menit, `metrics` tiap jam, `maintenance` tiap hari) dengan header `Authorization: Bearer CRON_SECRET`, lalu lakukan smoke test di production.

---

## 12. Master Starter Prompt (Siap Coding untuk AI Agent)

*Salin prompt di bawah ini ke AI Coding Assistant (Google Antigravity / Cursor / Claude Code / GitHub Copilot / Roo Code / dll.) untuk memulai pengerjaan:*
```markdown
Halo! Kamu berperan sebagai Senior Fullstack Architect dan Lead Developer.
Saya ingin membangun aplikasi "ThreadMe" berdasarkan dokumen PRD ini.

Silakan baca file @PRD.md

ATURAN EKSEKUSI (WAJIB DIPATUHI):
1. Pekerjaan dibagi menjadi 3 FASE (Tahap 1, Tahap 2, Tahap 3) di Bab 11. Kerjakan SATU FASE PENUH secara mandiri dalam satu putaran, yaitu seluruh Task dalam fase tersebut (misal Task 1.1 sampai 1.5), tanpa berhenti di tengah fase untuk meminta konfirmasi per task.
2. Setelah satu fase selesai, BERHENTI. Laporkan ringkasan hasil: daftar file yang dibuat/diubah, cara menjalankan dan mengujinya, serta kendala yang ada. Lalu TUNGGU konfirmasi dari saya sebelum memulai fase berikutnya. Jangan pernah masuk ke fase berikutnya tanpa izin saya.
3. Patuhi Tech Stack (Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui, Auth.js Google OAuth, Neon PostgreSQL + Drizzle ORM, Gemini via @google/genai), skema database di Bab 10, dan Pedoman UI/UX Design System di Bab 4.
4. DILARANG membuat halaman placeholder atau "sedang dalam pengembangan". Semua halaman di Bab 3 harus berisi UI penuh dan interaktif dengan data dummy berbahasa Indonesia (tanpa Lorem Ipsum) pada Fase 1.
5. Gunakan nama halaman, rute URL, dan nama tabel persis seperti di PRD. Tambahkan komentar singkat pada logika penting (cron, publikasi, enkripsi token).
6. Jangan pernah menaruh API key, token Threads, atau secret di kode client. Semua melalui environment variable sesuai `.env.example`.
7. Pastikan `npm run build` lulus tanpa error di akhir setiap fase.

Jika kamu sudah membaca dan memahami PRD, berikan ringkasan singkat pemahamanmu (maksimal 10 poin), sebutkan asumsi atau pertanyaan yang perlu saya jawab, lalu tanyakan kesiapan saya untuk memulai FASE 1 (Task 1.1 sampai 1.5).
```

---

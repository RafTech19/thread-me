export interface PostItem {
  id: string;
  postId: string;
  position: number;
  content: string;
  threadsMediaId?: string;
  status: "draft" | "scheduled" | "publishing" | "published" | "failed" | "cancelled";
  publishedAt?: string;
}

export interface PostMetric {
  id: string;
  postId: string;
  likes: number;
  replies: number;
  views: number;
  reposts: number;
  quotes: number;
  fetchedAt: string;
}

export interface Post {
  id: string;
  type: "single" | "thread";
  source: "manual" | "generator" | "automation";
  topic: string;
  status: "draft" | "scheduled" | "publishing" | "published" | "failed" | "cancelled";
  scheduledAt?: string;
  publishedAt?: string;
  threadsMediaId?: string;
  permalink?: string;
  retryCount: number;
  errorMessage?: string;
  aiGenerated: boolean;
  autoScheduleId?: string;
  createdAt: string;
  items: PostItem[];
  metrics?: PostMetric;
}

export interface AutoSchedule {
  id: string;
  name: string;
  topic: string;
  instructions: string;
  tone: string;
  language: string;
  format: "single" | "thread";
  threadLength: number;
  intervalMinutes: number;
  windowStart: string;
  windowEnd: string;
  activeDays: number[];
  mode: "auto_publish" | "review_first";
  isActive: boolean;
  nextRunAt: string;
  lastRunAt: string;
  totalGenerated: number;
}

export interface AIUsageLog {
  id: string;
  feature: "thread_generator" | "auto_schedule" | "regenerate_part";
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
  status: "success" | "error" | "rate_limited";
  errorMessage?: string;
  topic: string;
  createdAt: string;
}

export interface InAppNotification {
  id: string;
  type:
    | "post_published"
    | "post_failed"
    | "draft_ready"
    | "token_expiring"
    | "token_invalid"
    | "ai_quota_warning"
    | "ai_quota_exhausted";
  title: string;
  message: string;
  postId?: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AppSettings {
  ownerEmail: string;
  ownerName: string;
  threadsUsername: string;
  threadsConnected: boolean;
  tokenExpiresAt: string;
  timezone: string;
  brandVoice: string;
  defaultLanguage: string;
  aiDailyRequestLimit: number;
  maxPostsPerDay: number;
  reviewBeforePublish: boolean;
}

export const initialSettings: AppSettings = {
  ownerEmail: "rafli.bim05@gmail.com",
  ownerName: "Kaito deluxe",
  threadsUsername: "@kaitodex.19",
  threadsConnected: true,
  tokenExpiresAt: "2026-12-31T23:59:59Z",
  timezone: "Asia/Jakarta",
  brandVoice:
    "Santai, edukatif, kredibel, berbasis fakta berita terkini dengan menyertakan tautan sumber referensi resmi.",
  defaultLanguage: "id",
  aiDailyRequestLimit: 50,
  maxPostsPerDay: 10,
  reviewBeforePublish: true,
};

export const initialPosts: Post[] = [
  {
    id: "post-1",
    type: "single",
    source: "generator",
    topic: "Update Berita Terkini Regulasi AI & Keamanan Data",
    status: "published",
    publishedAt: "2026-11-10T02:00:00Z", // 09:00 WIB
    threadsMediaId: "th_media_101",
    permalink: "https://threads.net/@kaitodex.19/post/101",
    retryCount: 0,
    aiGenerated: true,
    createdAt: "2026-11-09T14:30:00Z",
    items: [
      {
        id: "item-1-1",
        postId: "post-1",
        position: 1,
        content:
          "Pemerintah baru saja mengesahkan panduan etika pemanfaatan AI di sektor publik. Transparansi algoritma dan perlindungan privasi kini menjadi syarat mutlak bagi pengembang sistem mandiri.\n\nSumber referensi resmi: https://www.kompas.com/tag/ai-indonesia",
        threadsMediaId: "th_media_101",
        status: "published",
        publishedAt: "2026-11-10T02:00:00Z",
      },
    ],
    metrics: {
      id: "metric-1",
      postId: "post-1",
      likes: 482,
      replies: 67,
      views: 5320,
      reposts: 28,
      quotes: 14,
      fetchedAt: "2026-11-12T01:00:00Z",
    },
  },
  {
    id: "post-2",
    type: "single",
    source: "automation",
    topic: "Karier developer pemula",
    status: "published",
    publishedAt: "2026-11-11T03:30:00Z", // 10:30 WIB
    threadsMediaId: "th_media_102",
    permalink: "https://threads.net/@kaitodex.19/post/102",
    retryCount: 0,
    aiGenerated: true,
    createdAt: "2026-11-10T16:00:00Z",
    items: [
      {
        id: "item-2-1",
        postId: "post-2",
        position: 1,
        content:
          "3 kebiasaan kecil yang bikin developer pemula cepat naik level: baca kode orang lain, tulis catatan belajar, dan berani bertanya. Mana yang paling sering kamu skip?",
        threadsMediaId: "th_media_102",
        status: "published",
        publishedAt: "2026-11-11T03:30:00Z",
      },
    ],
    metrics: {
      id: "metric-2",
      postId: "post-2",
      likes: 312,
      replies: 45,
      views: 3890,
      reposts: 19,
      quotes: 9,
      fetchedAt: "2026-11-12T01:00:00Z",
    },
  },
  {
    id: "post-3",
    type: "thread",
    source: "generator",
    topic: "Perkembangan Ekosistem Open Source Indonesia 2026",
    status: "published",
    publishedAt: "2026-11-08T12:00:00Z", // 19:00 WIB
    threadsMediaId: "th_media_103",
    permalink: "https://threads.net/@kaitodex.19/post/103",
    retryCount: 0,
    aiGenerated: true,
    createdAt: "2026-11-08T08:00:00Z",
    items: [
      {
        id: "item-3-1",
        postId: "post-3",
        position: 1,
        content:
          "Perkembangan Ekosistem Open Source Indonesia 2026 🧵\n\nTahun ini kontribusi developer tanah air ke proyek teknologi global meningkat pesat. Berikut 4 tren penting yang patut disimak:",
        threadsMediaId: "th_media_103",
        status: "published",
        publishedAt: "2026-11-08T12:00:00Z",
      },
      {
        id: "item-3-2",
        postId: "post-3",
        position: 2,
        content:
          "1. Adopsi Arsitektur Terdistribusi\nBanyak tim teknik lokal mulai beralih ke micro-libraries dan edge runtime untuk menekan biaya cloud server.",
        threadsMediaId: "th_media_103_2",
        status: "published",
        publishedAt: "2026-11-08T12:01:00Z",
      },
      {
        id: "item-3-3",
        postId: "post-3",
        position: 3,
        content:
          "2. Kolaborasi Lintas Komunitas\nMeetup bulanan dan program mentoring kian aktif memfasilitasi junior engineer untuk berkontribusi pada repositori publik.",
        threadsMediaId: "th_media_103_3",
        status: "published",
        publishedAt: "2026-11-08T12:02:00Z",
      },
      {
        id: "item-3-4",
        postId: "post-3",
        position: 4,
        content:
          "3. Standar Dokumentasi Rapi\nDokumentasi berbahasa Indonesia kini semakin lengkap, mempermudah adopsi teknologi baru di kampus dan industri.",
        threadsMediaId: "th_media_103_4",
        status: "published",
        publishedAt: "2026-11-08T12:03:00Z",
      },
      {
        id: "item-3-5",
        postId: "post-3",
        position: 5,
        content:
          "Bagaimana pengalamanmu berkontribusi pada proyek open source tahun ini? Ceritakan ceritamu di bawah!\n\nSumber referensi: https://www.antaranews.com/teknologi",
        threadsMediaId: "th_media_103_5",
        status: "published",
        publishedAt: "2026-11-08T12:04:00Z",
      },
    ],
    metrics: {
      id: "metric-3",
      postId: "post-3",
      likes: 420,
      replies: 58,
      views: 6100,
      reposts: 42,
      quotes: 17,
      fetchedAt: "2026-11-12T01:00:00Z",
    },
  },
  {
    id: "post-4",
    type: "single",
    source: "automation",
    topic: "Keuangan pribadi untuk anak muda",
    status: "scheduled",
    scheduledAt: "2026-11-13T02:00:00Z", // Besok 09:00 WIB
    retryCount: 0,
    aiGenerated: true,
    autoScheduleId: "schedule-3",
    createdAt: "2026-11-12T01:30:00Z",
    items: [
      {
        id: "item-4-1",
        postId: "post-4",
        position: 1,
        content:
          "Pelajaran finansial termahal di usia 20-an: gengsi itu mahal harganya. Beli barang yang tidak kita butuhkan hanya untuk membuat orang yang kita tidak kenal terkesan. Ada yang pernah mengalaminya?",
        status: "scheduled",
      },
    ],
  },
  {
    id: "post-5",
    type: "thread",
    source: "generator",
    topic: "Framework berpikir problem solving untuk insinyur perangkat lunak",
    status: "scheduled",
    scheduledAt: "2026-11-14T07:00:00Z", // Lusa 14:00 WIB
    retryCount: 0,
    aiGenerated: true,
    createdAt: "2026-11-12T02:00:00Z",
    items: [
      {
        id: "item-5-1",
        postId: "post-5",
        position: 1,
        content:
          "Kenapa developer senior bisa debugging jauh lebih cepat? Bukan karena mereka hafal semua syntax, tapi karena punya framework berpikir terstruktur. Ini 4 langkah intinya 🧵",
        status: "scheduled",
      },
      {
        id: "item-5-2",
        postId: "post-5",
        position: 2,
        content:
          "Langkah 1: Isolasi Masalah. Jangan menebak-nebak di mana bug terjadi. Buat skenario minimal yang bisa mereproduksi bug tersebut secara konsisten.",
        status: "scheduled",
      },
      {
        id: "item-5-3",
        postId: "post-5",
        position: 3,
        content:
          "Langkah 2: Periksa Asumsi. Masalah sering kali timbul karena asumsi kita tentang data atau API kontrak yang ternyata keliru.",
        status: "scheduled",
      },
    ],
  },
  {
    id: "post-6",
    type: "single",
    source: "manual",
    topic: "Catatan akhir pekan: refleksi diri",
    status: "draft",
    retryCount: 0,
    aiGenerated: false,
    createdAt: "2026-11-11T10:00:00Z",
    items: [
      {
        id: "item-6-1",
        postId: "post-6",
        position: 1,
        content:
          "Istirahat di akhir pekan tanpa rasa bersalah adalah skill yang perlu dilatih. Jangan biarkan pekerjaan menyusup ke waktu tenang bersama keluarga.",
        status: "draft",
      },
    ],
  },
  {
    id: "post-7",
    type: "single",
    source: "automation",
    topic: "Karier developer pemula",
    status: "failed",
    scheduledAt: "2026-11-09T05:00:00Z",
    retryCount: 3,
    errorMessage: "Threads API error: Access token has expired. Silakan hubungkan ulang akun.",
    aiGenerated: true,
    autoScheduleId: "schedule-2",
    createdAt: "2026-11-09T04:00:00Z",
    items: [
      {
        id: "item-7-1",
        postId: "post-7",
        position: 1,
        content:
          "Jangan takut memulai dari junior. Setiap senior engineer yang kamu kagumi saat ini pernah mengalami masa di mana sintaks git push saja membuat mereka panik.",
        status: "failed",
      },
    ],
  },
];

export const initialAutoSchedules: AutoSchedule[] = [
  {
    id: "schedule-1",
    name: "Produktivitas Harian",
    topic: "Produktivitas kerja remote dan manajemen energi",
    instructions: "Gunakan bahasa santai, berikan tips praktis 1 menit.",
    tone: "santai",
    language: "id",
    format: "single",
    threadLength: 1,
    intervalMinutes: 360, // 6 jam
    windowStart: "08:00",
    windowEnd: "20:00",
    activeDays: [1, 2, 3, 4, 5],
    mode: "auto_publish",
    isActive: true,
    nextRunAt: "2026-11-13T01:00:00Z",
    lastRunAt: "2026-11-12T07:00:00Z",
    totalGenerated: 18,
  },
  {
    id: "schedule-2",
    name: "Karier Tech Developer",
    topic: "Karier developer pemula dan tips interview",
    instructions: "Fokus pada pola pikir, mentalitas berkembang, dan portofolio.",
    tone: "edukatif",
    language: "id",
    format: "single",
    threadLength: 1,
    intervalMinutes: 720, // 12 jam
    windowStart: "09:00",
    windowEnd: "21:00",
    activeDays: [1, 3, 5],
    mode: "review_first",
    isActive: true,
    nextRunAt: "2026-11-14T02:00:00Z",
    lastRunAt: "2026-11-11T03:30:00Z",
    totalGenerated: 12,
  },
  {
    id: "schedule-3",
    name: "Berita & Tren Finansial",
    topic: "Berita pasar modal, inflasi, dan keuangan pribadi anak muda",
    instructions: "Sertakan tautan sumber berita kredibel di bagian akhir thread.",
    tone: "storytelling",
    language: "id",
    format: "thread",
    threadLength: 4,
    intervalMinutes: 1440, // 24 jam
    windowStart: "10:00",
    windowEnd: "19:00",
    activeDays: [0, 6],
    mode: "review_first",
    isActive: false,
    nextRunAt: "2026-11-15T03:00:00Z",
    lastRunAt: "2026-11-08T12:00:00Z",
    totalGenerated: 8,
  },
];

export const initialAIUsageLogs: AIUsageLog[] = [
  {
    id: "log-1",
    feature: "thread_generator",
    model: "gemini-3.8-flash",
    promptTokens: 420,
    completionTokens: 680,
    totalTokens: 1100,
    estimatedCostUsd: 0.00035,
    latencyMs: 1420,
    status: "success",
    topic: "Update Berita Terkini Regulasi AI & Keamanan Data",
    createdAt: "2026-11-12T02:15:00Z",
  },
  {
    id: "log-2",
    feature: "auto_schedule",
    model: "gemini-3.8-flash",
    promptTokens: 510,
    completionTokens: 820,
    totalTokens: 1330,
    estimatedCostUsd: 0.00042,
    latencyMs: 1840,
    status: "success",
    topic: "Berita & Tren Finansial",
    createdAt: "2026-11-12T01:30:00Z",
  },
  {
    id: "log-3",
    feature: "regenerate_part",
    model: "gemini-3.8-flash",
    promptTokens: 290,
    completionTokens: 210,
    totalTokens: 500,
    estimatedCostUsd: 0.00015,
    latencyMs: 980,
    status: "success",
    topic: "Hook post pertama",
    createdAt: "2026-11-11T14:10:00Z",
  },
  {
    id: "log-4",
    feature: "thread_generator",
    model: "gemini-3.8-flash",
    promptTokens: 450,
    completionTokens: 0,
    totalTokens: 450,
    estimatedCostUsd: 0.00005,
    latencyMs: 4800,
    status: "error",
    errorMessage: "503 model overloaded. Layanan Gemini sedang padat.",
    topic: "Arsitektur database multi-tenant",
    createdAt: "2026-11-11T09:20:00Z",
  },
  {
    id: "log-5",
    feature: "auto_schedule",
    model: "gemini-3.8-flash",
    promptTokens: 480,
    completionTokens: 750,
    totalTokens: 1230,
    estimatedCostUsd: 0.00038,
    latencyMs: 1650,
    status: "success",
    topic: "Karier developer pemula",
    createdAt: "2026-11-10T16:00:00Z",
  },
];

export const initialNotifications: InAppNotification[] = [
  {
    id: "notif-1",
    type: "post_published",
    title: "Postingan Berhasil Terbit",
    message: "Postingan 'Update Berita Terkini Regulasi AI & Keamanan Data' berhasil terbit di akun Threads @kaitodex.19 pukul 09.00 WIB.",
    postId: "post-1",
    linkUrl: "/posts/post-1",
    isRead: false,
    createdAt: "2026-11-10T02:00:00Z",
  },
  {
    id: "notif-2",
    type: "post_failed",
    title: "Postingan Gagal Terbit",
    message: "Postingan gagal terbit: Token Threads kedaluwarsa. Silakan buka Pengaturan untuk menghubungkan ulang.",
    postId: "post-7",
    linkUrl: "/posts/post-7",
    isRead: false,
    createdAt: "2026-11-09T05:00:00Z",
  },
  {
    id: "notif-3",
    type: "draft_ready",
    title: "Draft Baru Siap Ditinjau",
    message: "Draft baru dari aturan otomatis 'Karier tech developer' telah dibuat dan siap ditinjau.",
    postId: "post-6",
    linkUrl: "/posts",
    isRead: true,
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    id: "notif-4",
    type: "ai_quota_warning",
    title: "Peringatan Kuota AI",
    message: "Pemakaian AI hari ini telah mencapai 27 dari 50 request (54%). Kuota diperbarui pukul 00.00 WIB.",
    linkUrl: "/ai-usage",
    isRead: true,
    createdAt: "2026-11-12T02:30:00Z",
  },
];

export const performanceMetricsSummary = {
  totalLikes: 1214,
  totalReplies: 170,
  averageLikesPerPost: 404,
  averageRepliesPerPost: 56,
  publishedPostsCount: 3,
  likesGrowthPercent: 18.5,
  repliesGrowthPercent: 12.3,
  bestPost: {
    title: "Update Berita Terkini Regulasi AI & Keamanan Data",
    likes: 482,
    replies: 67,
    date: "10 Nov 2026",
    snippet: "Pemerintah baru saja mengesahkan panduan etika pemanfaatan AI di sektor publik...",
  },
  bestPostingTime: {
    day: "Rabu",
    time: "09.00 - 11.00 WIB",
    avgEngagement: "8.4%",
  },
  trendData: [
    { date: "06 Nov", likes: 120, replies: 18, engagement: 4.2 },
    { date: "07 Nov", likes: 180, replies: 24, engagement: 5.1 },
    { date: "08 Nov", likes: 420, replies: 58, engagement: 8.9 },
    { date: "09 Nov", likes: 210, replies: 32, engagement: 6.0 },
    { date: "10 Nov", likes: 482, replies: 67, engagement: 9.4 },
    { date: "11 Nov", likes: 312, replies: 45, engagement: 7.8 },
    { date: "12 Nov", likes: 290, replies: 39, engagement: 7.2 },
  ],
  hourlyData: [
    { hour: "08.00", count: 24 },
    { hour: "09.00", count: 78 },
    { hour: "10.00", count: 65 },
    { hour: "12.00", count: 42 },
    { hour: "14.00", count: 53 },
    { hour: "17.00", count: 68 },
    { hour: "19.00", count: 85 },
    { hour: "21.00", count: 49 },
  ],
};

/**
 * Data Analitik Resmi Meta Threads Akun @kaitodex.19
 * Sumber: Laporan Ekspor Threads Analytics Resmi (Periode 14 Okt - 12 Nov 2026 / 30 Hari Terakhir)
 */

export interface SparklinePoint {
  date: string;
  value: number;
}

export interface ThreadsOfficialAnalytics {
  profile: {
    username: string;
    displayName: string;
    avatarUrl: string;
    periodLabel: string;
    timezone: string;
  };
  summary: {
    views: {
      total: number;
      growthPercent: number;
      trend: SparklinePoint[];
    };
    viewers: {
      total: number;
      growthPercent: number;
      trend: SparklinePoint[];
    };
    netFollowers: {
      total: number;
      growthPercent: number;
      trend: SparklinePoint[];
    };
    interactions: {
      total: number;
      growthPercent: number;
      trend: SparklinePoint[];
    };
  };
  audienceReach: {
    totalViewers: number;
    growthPercent: number;
    sinceDate: string;
    followers: {
      count: number;
      percentage: number;
      growthPercent: number;
    };
    nonFollowers: {
      count: number;
      percentage: number;
      growthPercent: number;
    };
  };
  geography: {
    topCountries: { name: string; percentage: number; code: string }[];
    topCities: { name: string; percentage: number }[];
  };
  demographics: {
    ageDistribution: { range: string; percentage: number }[];
    genderBreakdown: { gender: string; percentage: number; color: string }[];
  };
  topCommunities: { name: string; count: number; icon: string }[];
  mostActiveTimes: {
    day: string;
    timeRange: string;
    viewers: number;
    isPeak: boolean;
  }[];
}

export const threadsOfficialAnalyticsData: ThreadsOfficialAnalytics = {
  profile: {
    username: "kaitodex.19",
    displayName: "Rafli",
    avatarUrl:
      "https://instagram.fcgk29-1.fna.fbcdn.net/v/t51.82787-19/760443579_17980975158105978_9218223467534795003_n.jpg",
    periodLabel: "14 Okt - 12 Nov 2026 (30 Hari Terakhir)",
    timezone: "WIB (+07:00)",
  },
  summary: {
    views: {
      total: 1000,
      growthPercent: 809,
      trend: [
        { date: "14 Okt", value: 15 },
        { date: "18 Okt", value: 12 },
        { date: "22 Okt", value: 18 },
        { date: "26 Okt", value: 24 },
        { date: "29 Okt", value: 130 },
        { date: "02 Nov", value: 85 },
        { date: "06 Nov", value: 165 },
        { date: "09 Nov", value: 215 },
        { date: "12 Nov", value: 233 },
        { date: "16 Nov", value: 318 },
      ],
    },
    viewers: {
      total: 767,
      growthPercent: 792,
      trend: [
        { date: "14 Okt", value: 12 },
        { date: "18 Okt", value: 10 },
        { date: "22 Okt", value: 15 },
        { date: "26 Okt", value: 20 },
        { date: "29 Okt", value: 110 },
        { date: "02 Nov", value: 70 },
        { date: "06 Nov", value: 135 },
        { date: "09 Nov", value: 175 },
        { date: "12 Nov", value: 187 },
        { date: "16 Nov", value: 230 },
      ],
    },
    netFollowers: {
      total: 3,
      growthPercent: 8,
      trend: [
        { date: "14 Okt", value: 0 },
        { date: "21 Okt", value: 0 },
        { date: "28 Okt", value: 2 },
        { date: "04 Nov", value: 0 },
        { date: "11 Nov", value: 1 },
      ],
    },
    interactions: {
      total: 28,
      growthPercent: 0,
      trend: [
        { date: "02 Nov", value: 2 },
        { date: "05 Nov", value: 2 },
        { date: "07 Nov", value: 1 },
        { date: "09 Nov", value: 4 },
        { date: "12 Nov", value: 10 },
        { date: "16 Nov", value: 19 },
      ],
    },
  },
  audienceReach: {
    totalViewers: 767,
    growthPercent: 792,
    sinceDate: "14 Okt",
    followers: {
      count: 8,
      percentage: 1.0,
      growthPercent: 700,
    },
    nonFollowers: {
      count: 759,
      percentage: 99.0,
      growthPercent: 792,
    },
  },
  geography: {
    topCountries: [
      { name: "Indonesia", percentage: 95.46, code: "ID" },
      { name: "Malaysia", percentage: 1.58, code: "MY" },
      { name: "United States", percentage: 0.99, code: "US" },
      { name: "Taiwan", percentage: 0.39, code: "TW" },
      { name: "Japan", percentage: 0.39, code: "JP" },
    ],
    topCities: [
      { name: "Jakarta", percentage: 24.65 },
      { name: "Bekasi", percentage: 5.52 },
      { name: "Depok", percentage: 4.54 },
      { name: "Bandung", percentage: 4.34 },
      { name: "Surabaya", percentage: 4.14 },
    ],
  },
  demographics: {
    ageDistribution: [
      { range: "25-34", percentage: 50.3 },
      { range: "18-24", percentage: 32.15 },
      { range: "35-44", percentage: 10.85 },
      { range: "45-54", percentage: 5.33 },
      { range: "65+", percentage: 0.79 },
      { range: "55-64", percentage: 0.39 },
      { range: "13-17", percentage: 0.2 },
    ],
    genderBreakdown: [
      { gender: "Wanita (Female)", percentage: 36.09, color: "#8b5cf6" },
      { gender: "Pria (Male)", percentage: 35.9, color: "#2563eb" },
      { gender: "Lainnya / Anonim", percentage: 28.01, color: "#64748b" },
    ],
  },
  topCommunities: [
    { name: "Book Threads", count: 16, icon: "📚" },
    { name: "Business Threads", count: 10, icon: "💼" },
    { name: "AI Threads", count: 9, icon: "🤖" },
    { name: "Running Threads", count: 8, icon: "🏃" },
    { name: "Food Threads", count: 8, icon: "🍲" },
  ],
  mostActiveTimes: [
    {
      day: "Rabu (Wednesday)",
      timeRange: "16:00 - 19:00 WIB",
      viewers: 261,
      isPeak: true,
    },
    {
      day: "Kamis (Thursday)",
      timeRange: "16:00 - 19:00 WIB",
      viewers: 229,
      isPeak: false,
    },
    {
      day: "Jumat (Friday)",
      timeRange: "16:00 - 19:00 WIB",
      viewers: 227,
      isPeak: false,
    },
  ],
};


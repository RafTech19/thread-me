/**
 * Data Analitik Resmi Meta Threads Akun @kaitodex.19
 * Sumber: Laporan Ekspor Threads Analytics Resmi (Periode 24 Okt - 22 Nov 2026 / 30 Hari Terakhir)
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
      "https://instagram.fcgk6-2.fna.fbcdn.net/v/t51.82787-19/760443579_17980975158105978_9218223467534795003_n.jpg",
    periodLabel: "24 Okt - 22 Nov 2026 (30 Hari Terakhir)",
    timezone: "WIB (+07:00)",
  },
  summary: {
    views: {
      total: 2243,
      growthPercent: 1903,
      trend: [
        { date: "24 Okt", value: 0 },
        { date: "27 Okt", value: 3 },
        { date: "31 Okt", value: 1 },
        { date: "02 Nov", value: 110 },
        { date: "04 Nov", value: 135 },
        { date: "05 Nov", value: 101 },
        { date: "06 Nov", value: 35 },
        { date: "09 Nov", value: 2 },
        { date: "10 Nov", value: 198 },
        { date: "12 Nov", value: 190 },
        { date: "13 Nov", value: 94 },
        { date: "15 Nov", value: 26 },
        { date: "16 Nov", value: 36 },
        { date: "17 Nov", value: 13 },
        { date: "18 Nov", value: 392 },
        { date: "19 Nov", value: 202 },
        { date: "20 Nov", value: 23 },
        { date: "21 Nov", value: 33 },
        { date: "22 Nov", value: 562 },
      ],
    },
    viewers: {
      total: 1677,
      growthPercent: 1763,
      trend: [
        { date: "24 Okt", value: 0 },
        { date: "27 Okt", value: 2 },
        { date: "31 Okt", value: 1 },
        { date: "02 Nov", value: 82 },
        { date: "04 Nov", value: 101 },
        { date: "05 Nov", value: 76 },
        { date: "06 Nov", value: 26 },
        { date: "09 Nov", value: 2 },
        { date: "10 Nov", value: 148 },
        { date: "12 Nov", value: 142 },
        { date: "13 Nov", value: 70 },
        { date: "15 Nov", value: 19 },
        { date: "16 Nov", value: 27 },
        { date: "17 Nov", value: 10 },
        { date: "18 Nov", value: 293 },
        { date: "19 Nov", value: 151 },
        { date: "20 Nov", value: 17 },
        { date: "21 Nov", value: 25 },
        { date: "22 Nov", value: 420 },
      ],
    },
    netFollowers: {
      total: 3,
      growthPercent: 8,
      trend: [
        { date: "24 Okt", value: 0 },
        { date: "28 Okt", value: 0 },
        { date: "04 Nov", value: 2 },
        { date: "07 Nov", value: 0 },
        { date: "11 Nov", value: 1 },
        { date: "16 Nov", value: 0 },
        { date: "21 Nov", value: 0 },
        { date: "22 Nov", value: 0 },
      ],
    },
    interactions: {
      total: 75,
      growthPercent: 0,
      trend: [
        { date: "24 Okt", value: 0 },
        { date: "02 Nov", value: 2 },
        { date: "05 Nov", value: 2 },
        { date: "07 Nov", value: 1 },
        { date: "10 Nov", value: 6 },
        { date: "12 Nov", value: 10 },
        { date: "16 Nov", value: 5 },
        { date: "18 Nov", value: 14 },
        { date: "22 Nov", value: 35 },
      ],
    },
  },
  audienceReach: {
    totalViewers: 1677,
    growthPercent: 1763,
    sinceDate: "24 Okt",
    followers: {
      count: 9,
      percentage: 1.0,
      growthPercent: 350,
    },
    nonFollowers: {
      count: 1668,
      percentage: 99.0,
      growthPercent: 1795,
    },
  },
  geography: {
    topCountries: [
      { name: "Indonesia", percentage: 95.91, code: "ID" },
      { name: "Malaysia", percentage: 1.0, code: "MY" },
      { name: "United States", percentage: 0.82, code: "US" },
      { name: "Taiwan", percentage: 0.27, code: "TW" },
      { name: "Kazakhstan", percentage: 0.18, code: "KZ" },
    ],
    topCities: [
      { name: "Jakarta", percentage: 20.56 },
      { name: "Bekasi", percentage: 8.1 },
      { name: "Bandung", percentage: 4.09 },
      { name: "Depok", percentage: 3.82 },
      { name: "Surabaya", percentage: 3.28 },
    ],
  },
  demographics: {
    ageDistribution: [
      { range: "25-34", percentage: 49.23 },
      { range: "18-24", percentage: 34.03 },
      { range: "35-44", percentage: 9.92 },
      { range: "45-54", percentage: 4.91 },
      { range: "65+", percentage: 1.0 },
      { range: "55-64", percentage: 0.73 },
      { range: "13-17", percentage: 0.18 },
    ],
    genderBreakdown: [
      { gender: "Wanita (Female)", percentage: 38.31, color: "#8b5cf6" },
      { gender: "Pria (Male)", percentage: 33.12, color: "#2563eb" },
      { gender: "Lainnya / Anonim", percentage: 28.57, color: "#64748b" },
    ],
  },
  topCommunities: [
    { name: "Book Threads", count: 27, icon: "📚" },
    { name: "AI Threads", count: 18, icon: "🤖" },
    { name: "Food Threads", count: 18, icon: "🍲" },
    { name: "Running Threads", count: 16, icon: "🏃" },
    { name: "Business Threads", count: 14, icon: "💼" },
  ],
  mostActiveTimes: [
    {
      day: "Kamis (Thursday)",
      timeRange: "16:00 - 19:00 WIB",
      viewers: 430,
      isPeak: true,
    },
    {
      day: "Jumat (Friday)",
      timeRange: "16:00 - 19:00 WIB",
      viewers: 415,
      isPeak: false,
    },
    {
      day: "Sabtu (Saturday)",
      timeRange: "16:00 - 19:00 WIB",
      viewers: 382,
      isPeak: false,
    },
  ],
};

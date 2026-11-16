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
  (t) => [index("ai_usage_created_idx").on(t.createdAt)]
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
  ]
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
  (t) => [index("post_items_post_idx").on(t.postId, t.position)]
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
  (t) => [index("post_metrics_post_fetched_idx").on(t.postId, t.fetchedAt)]
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
  (t) => [index("notifications_read_created_idx").on(t.isRead, t.createdAt)]
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


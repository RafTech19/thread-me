CREATE TYPE "public"."ai_feature" AS ENUM('thread_generator', 'auto_schedule', 'regenerate_part');--> statement-breakpoint
CREATE TYPE "public"."ai_status" AS ENUM('success', 'error', 'rate_limited');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('active', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('post_published', 'post_failed', 'draft_ready', 'token_expiring', 'token_invalid', 'ai_quota_warning', 'ai_quota_exhausted');--> statement-breakpoint
CREATE TYPE "public"."post_source" AS ENUM('manual', 'generator', 'automation');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('single', 'thread');--> statement-breakpoint
CREATE TYPE "public"."schedule_mode" AS ENUM('auto_publish', 'review_first');--> statement-breakpoint
CREATE TABLE "ai_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feature" "ai_feature" NOT NULL,
	"model" varchar(64) NOT NULL,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"estimated_cost_usd" numeric(10, 6) DEFAULT '0' NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"status" "ai_status" NOT NULL,
	"error_message" text,
	"topic" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"owner_email" varchar(255) NOT NULL,
	"timezone" varchar(64) DEFAULT 'Asia/Jakarta' NOT NULL,
	"brand_voice" text DEFAULT '',
	"default_language" varchar(8) DEFAULT 'id' NOT NULL,
	"ai_daily_request_limit" integer DEFAULT 50 NOT NULL,
	"max_posts_per_day" integer DEFAULT 10 NOT NULL,
	"review_before_publish" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auto_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"topic" varchar(255) NOT NULL,
	"instructions" text DEFAULT '',
	"tone" varchar(40) DEFAULT 'santai' NOT NULL,
	"language" varchar(8) DEFAULT 'id' NOT NULL,
	"format" "post_type" DEFAULT 'single' NOT NULL,
	"thread_length" integer DEFAULT 5 NOT NULL,
	"interval_minutes" integer DEFAULT 360 NOT NULL,
	"window_start" varchar(5) DEFAULT '08:00' NOT NULL,
	"window_end" varchar(5) DEFAULT '21:00' NOT NULL,
	"active_days" jsonb DEFAULT '[0,1,2,3,4,5,6]'::jsonb NOT NULL,
	"mode" "schedule_mode" DEFAULT 'review_first' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"next_run_at" timestamp with time zone,
	"last_run_at" timestamp with time zone,
	"total_generated" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(160) NOT NULL,
	"message" text NOT NULL,
	"post_id" uuid,
	"link_url" varchar(255),
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"content" varchar(500) NOT NULL,
	"threads_media_id" varchar(64),
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "post_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"replies" integer DEFAULT 0 NOT NULL,
	"views" integer,
	"reposts" integer,
	"quotes" integer,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "post_type" DEFAULT 'single' NOT NULL,
	"source" "post_source" DEFAULT 'manual' NOT NULL,
	"topic" varchar(255),
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"threads_media_id" varchar(64),
	"permalink" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"next_retry_at" timestamp with time zone,
	"error_message" text,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"auto_schedule_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "threads_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"threads_user_id" varchar(64) NOT NULL,
	"username" varchar(100) NOT NULL,
	"profile_picture_url" text,
	"access_token_enc" text NOT NULL,
	"scopes" text NOT NULL,
	"status" "connection_status" DEFAULT 'active' NOT NULL,
	"token_expires_at" timestamp with time zone NOT NULL,
	"last_refreshed_at" timestamp with time zone,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "threads_connections_threads_user_id_unique" UNIQUE("threads_user_id")
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_items" ADD CONSTRAINT "post_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_metrics" ADD CONSTRAINT "post_metrics_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_auto_schedule_id_auto_schedules_id_fk" FOREIGN KEY ("auto_schedule_id") REFERENCES "public"."auto_schedules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_usage_created_idx" ON "ai_usage_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_read_created_idx" ON "notifications" USING btree ("is_read","created_at");--> statement-breakpoint
CREATE INDEX "post_items_post_idx" ON "post_items" USING btree ("post_id","position");--> statement-breakpoint
CREATE INDEX "post_metrics_post_fetched_idx" ON "post_metrics" USING btree ("post_id","fetched_at");--> statement-breakpoint
CREATE INDEX "posts_status_scheduled_idx" ON "posts" USING btree ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX "posts_published_at_idx" ON "posts" USING btree ("published_at");
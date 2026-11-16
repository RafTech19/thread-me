"use server";

import { z } from "zod";
import { requireOwner } from "@/lib/auth/session";
import { generateThreadWithGemini } from "@/lib/ai/gemini";
import { revalidatePath } from "next/cache";

const generateSchema = z.object({
  topic: z.string().min(1, "Topik wajib diisi"),
  category: z.string().optional(),
  format: z.enum(["single", "thread"]),
  threadLength: z.number().min(1).max(10).optional(),
  tone: z.string().default("santai"),
  language: z.string().default("id"),
  engagementMode: z.boolean().default(true),
});

export async function generateThreadAction(input: z.infer<typeof generateSchema>) {
  await requireOwner();
  const validated = generateSchema.parse(input);

  const fullTopic = validated.category && validated.category !== "all"
    ? `[Kategori: ${validated.category}] ${validated.topic}`
    : validated.topic;

  const result = await generateThreadWithGemini({
    topic: fullTopic,
    format: validated.format,
    threadLength: validated.threadLength,
    tone: validated.tone,
    language: validated.language,
    engagementMode: validated.engagementMode,
    feature: "thread_generator",
  });

  revalidatePath("/ai-usage");
  return { success: true, data: result };
}

export async function regeneratePartAction(params: {
  topic: string;
  position: number;
  totalLength: number;
}) {
  await requireOwner();

  // Memanggil regenerate bagian spesifik via Gemini
  const result = await generateThreadWithGemini({
    topic: `Revisi bagian ${params.position} untuk topik: ${params.topic}`,
    format: "single",
    feature: "regenerate_part",
  });

  revalidatePath("/ai-usage");
  return { success: true, item: result.posts[0] };
}


"use server";

import { requireOwner } from "@/lib/auth/session";
import { getRealtimeUsageSummary, recordAIUsage } from "@/lib/ai/tracker";
import { calculateEstimatedCostUsd } from "@/lib/ai/pricing";

export async function getRealtimeAIUsageAction() {
  await requireOwner();
  return await getRealtimeUsageSummary();
}

/**
 * Menguji koneksi real-time ke API Google Gemini menggunakan API key pengguna.
 * Mengukur latensi aktual dan mencatat respon resmi dari model.
 */
export async function testGeminiConnectionAction() {
  await requireOwner();

  const apiKey = process.env.GEMINI_API_KEY;
  let modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const startTime = Date.now();

  if (!apiKey || apiKey.includes("dummy")) {
    return {
      success: false,
      message: "API Key belum terpasang di .env.local",
      latencyMs: 0,
    };
  }

  try {
    const callProbe = async (model: string) => {
      return await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Ping koneksi ThreadMe. Berikan respon 1 kata: 'OK'.",
                  },
                ],
              },
            ],
          }),
        }
      );
    };

    let response = await callProbe(modelName);

    // Fallback otomatis jika 503 high demand
    if (response.status === 503 && modelName !== "gemini-2.5-flash") {
      modelName = "gemini-2.5-flash";
      response = await callProbe(modelName);
    }

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        message: `Google API Error (${response.status}): ${errText}`,
        latencyMs,
      };
    }

    const data = await response.json();
    const promptTokens = data.usageMetadata?.promptTokenCount || 10;
    const completionTokens = data.usageMetadata?.candidatesTokenCount || 2;
    const totalTokens = data.usageMetadata?.totalTokenCount || 12;
    const costUsd = calculateEstimatedCostUsd(promptTokens, completionTokens);

    await recordAIUsage({
      feature: "probe_test",
      model: modelName,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd: costUsd,
      latencyMs,
      status: "success",
      topic: "Uji Koneksi Real-Time API Key",
    });

    return {
      success: true,
      model: modelName,
      latencyMs,
      tokens: totalTokens,
      message: "Koneksi ke server Google Gemini berhasil & aktif!",
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menghubungi endpoint Google",
      latencyMs,
    };
  }
}


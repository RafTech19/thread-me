/**
 * Konfigurasi tarif estimasi biaya model Google Gemini per 1.000.000 token.
 * Berdasarkan tarif resmi Gemini 2.5 Flash (US$).
 */
export const GEMINI_PRICING = {
  // Input prompt: US$ 0.075 per 1M token
  promptPerMillionUsd: 0.075,
  // Output completion: US$ 0.30 per 1M token
  completionPerMillionUsd: 0.3,
};

/**
 * Menghitung estimasi biaya pemanggilan Gemini dalam US$.
 */
export function calculateEstimatedCostUsd(
  promptTokens: number,
  completionTokens: number
): number {
  const promptCost = (promptTokens / 1_000_000) * GEMINI_PRICING.promptPerMillionUsd;
  const completionCost =
    (completionTokens / 1_000_000) * GEMINI_PRICING.completionPerMillionUsd;
  return Number((promptCost + completionCost).toFixed(6));
}


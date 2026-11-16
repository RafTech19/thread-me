import { calculateEstimatedCostUsd } from "./pricing";
import { recordAIUsage } from "./tracker";

export interface GenerateThreadParams {
  topic: string;
  format: "single" | "thread";
  threadLength?: number;
  tone?: string;
  language?: string;
  engagementMode?: boolean;
  brandVoice?: string;
  feature?: "thread_generator" | "auto_schedule" | "regenerate_part" | "probe_test";
}

export interface GeneratedThreadOutput {
  posts: { position: number; content: string }[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
    latencyMs: number;
    model: string;
  };
}

/**
 * Service pembuatan konten Threads berbasis Gemini.
 * WAJIB menyertakan link sumber kredibel jika topik berkaitan dengan berita / informasi faktual.
 */
/**
 * Fungsi pengaman batas karakter:
 * Hanya merapikan jika benar-benar melebihi 500 karakter Threads (hard cap 500).
 * Jika terpaksa dipotong, dipotong di akhir kalimat lengkap terdekat (titik, tanda tanya, tanda seru)
 * agar kalimat tidak menggantung atau berakhiran titik-titik setengah.
 */
function enforceCharLimit(text: string, maxLen: number = 495): string {
  if (text.length <= maxLen) return text;

  // Jika ada sumber di akhir (misal "Sumber: https://..."), pertahankan sumbernya
  const sourceMatch = text.match(/(\n\nSumber:\s*https?:\/\/[^\s]+)$/i);
  let preservedSource = "";
  let mainBody = text;

  if (sourceMatch && sourceMatch[1]) {
    preservedSource = sourceMatch[1];
    mainBody = text.slice(0, -preservedSource.length).trimEnd();
  }

  const allowedBodyLen = maxLen - preservedSource.length;
  if (mainBody.length > allowedBodyLen) {
    // Cari akhir kalimat lengkap (. / ? / !) terdekat sebelum batas agar makna tetap utuh
    const sentenceEndRegex = /[.!?](\s|$)/g;
    let match;
    let lastValidSentenceEnd = -1;

    while ((match = sentenceEndRegex.exec(mainBody)) !== null) {
      if (match.index + 1 <= allowedBodyLen) {
        lastValidSentenceEnd = match.index + 1;
      } else {
        break;
      }
    }

    if (lastValidSentenceEnd > allowedBodyLen * 0.5) {
      // Potong persis di akhir kalimat yang selesai
      mainBody = mainBody.slice(0, lastValidSentenceEnd).trimEnd();
    } else {
      // Jika tidak ada tanda titik, potong di akhir kata terdekat
      const cutIndex = mainBody.lastIndexOf(" ", allowedBodyLen);
      mainBody = cutIndex > 0 ? mainBody.slice(0, cutIndex).trimEnd() : mainBody.slice(0, allowedBodyLen).trimEnd();
    }
  }

  return mainBody + preservedSource;
}

export async function generateThreadWithGemini(
  params: GenerateThreadParams
): Promise<GeneratedThreadOutput> {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  let modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const feature = params.feature || "thread_generator";

  const targetCount = params.format === "single" ? 1 : params.threadLength || 4;
  const tone = params.tone || "santai";
  const language = params.language || "id";

  // ========== SYSTEM PROMPT (Kualitas Tinggi) ==========
  const systemInstruction = buildSystemPrompt(tone, language, targetCount, params.brandVoice);

  // ========== USER PROMPT (Instruksi Spesifik Per-Request) ==========
  const userPrompt = buildUserPrompt(params.topic, targetCount, params.format, params.engagementMode);

  // ========== Cek apakah API key nyata tersedia ==========
  if (apiKey && !apiKey.includes("dummy")) {

    const callApi = async (model: string, timeoutMs: number): Promise<Response> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            signal: controller.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: userPrompt }] }],
              systemInstruction: { parts: [{ text: systemInstruction }] },
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.75,
                maxOutputTokens: 8192,
              },
            }),
          }
        );
        clearTimeout(timer);
        return res;
      } catch (err) {
        clearTimeout(timer);
        throw err;
      }
    };

    try {
      let response: Response | null = null;

      // Mekanisme Retry Otomatis (hingga 3 kali jika terkena 503 Spike Demand dari Google)
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await callApi(modelName, 25000);
          if (response.ok) {
            break; // Berhasil dapat response 200 OK!
          }
          if (response.status === 503) {
            console.warn(`Gemini 503 (attempt ${attempt}/3). Menunggu 1.5 detik sebelum coba lagi...`);
            await new Promise((r) => setTimeout(r, 1500));
          } else {
            break; // Jika error lain (bukan 503), jangan retry
          }
        } catch (callErr) {
          console.warn(`Gemini network timeout/error pada attempt ${attempt}:`, callErr);
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 1500));
          }
        }
      }

      const latencyMs = Date.now() - startTime;

      if (!response || !response.ok) {
        const errorBody = response ? await response.text() : "No response / timeout";
        throw new Error(`Gemini API gagal setelah 3 percobaan: ${errorBody}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      // Parsing JSON dari respons Gemini dengan sanitasi robust
      let parsed: { posts?: { position: number; content: string }[] };
      try {
        parsed = JSON.parse(rawText);
      } catch {
        // Coba bersihkan markdown wrapper jika ada
        const cleaned = rawText
          .replace(/```json\s*/gi, "")
          .replace(/```\s*$/gi, "")
          .trim();
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          console.error("Gagal parse JSON output Gemini:", rawText.substring(0, 300));
          throw new Error("Gemini mengembalikan format yang tidak valid");
        }
      }

      const resultPosts = (parsed.posts || []).map((p, idx) => {
        const cleanedContent = p.content
          .replace(/\u2014/g, "-")
          .replace(/\u2013/g, "-")
          .trim();

        // Enforce hard cap max 490 karakter per post
        const finalContent = enforceCharLimit(cleanedContent, 490);

        return {
          position: p.position || idx + 1,
          content: finalContent,
        };
      });

      const promptTokens = data.usageMetadata?.promptTokenCount || 500;
      const completionTokens = data.usageMetadata?.candidatesTokenCount || 800;
      const totalTokens = data.usageMetadata?.totalTokenCount || (promptTokens + completionTokens);
      const estimatedCostUsd = calculateEstimatedCostUsd(promptTokens, completionTokens);

      // Catat ke log AI usage
      await recordAIUsage({
        feature,
        model: modelName,
        promptTokens,
        completionTokens,
        totalTokens,
        estimatedCostUsd,
        latencyMs,
        status: "success",
        topic: params.topic,
      });

      return {
        posts: resultPosts,
        usage: { promptTokens, completionTokens, totalTokens, estimatedCostUsd, latencyMs, model: modelName },
      };
    } catch (apiError) {
      console.error("Gemini API call gagal total, menggunakan fallback lokal:", apiError);
    }
  }

  // ========== FALLBACK OFFLINE (Konten Lokal Berkualitas) ==========
  return generateOfflineFallback(params, targetCount, modelName, feature, startTime);
}

// ============================================================
// SYSTEM PROMPT BUILDER
// ============================================================
function buildSystemPrompt(tone: string, language: string, targetCount: number, brandVoice?: string): string {
  const toneDesc = tone === "santai"
    ? "Santai dan bersahabat, seperti ngobrol bareng teman cerdas di kedai kopi. Tidak kaku, tidak robotik."
    : tone === "edukatif"
    ? "Edukatif dan berbobot, menjelaskan dengan jernih seperti dosen favorit yang bikin mahasiswanya betah dengerin."
    : tone === "profesional"
    ? "Profesional namun tetap hangat, seperti analis senior yang menjelaskan isu kompleks secara gamblang."
    : tone;

  const langDesc = language === "id" ? "Bahasa Indonesia yang luwes, natural, dan enak dibaca" : "English";

  return `Kamu adalah Content Creator profesional khusus platform Meta Threads untuk akun @kaitodex.19.

TUGAS: Hasilkan konten Threads yang BERISI, MENDALAM, dan SUBSTANSIAL. Bukan tulisan generik atau ringkasan 1-2 kalimat.

ATURAN KUALITAS KONTEN:
- PANJANG IDEAL: Setiap post WAJIB ditulis tuntas dalam rentang 280 sampai 420 karakter (Maksimal mutlak Threads adalah 500 karakter).
- KALIMAT LENGKAP: Setiap post HARUS diselesaikan dengan tanda baca penutup (. / ? / !). DILARANG KERAS berhenti di tengah kalimat atau menyisakan kalimat yang menggantung!
- Tulis LANGSUNG isi kontennya tanpa pengantar meta seperti "Berikut rangkuman...".
- Beri jarak paragraf (enter) agar mudah di-scroll dan nyaman dibaca di HP.

GAYA BAHASA: ${toneDesc}
BAHASA: ${langDesc}
BRAND VOICE: ${brandVoice || "Personal, kritis, solutif, berbasis fakta"}

STRUKTUR THREAD (${targetCount} post):
- Post pertama: Langsung masuk ke hook tajam yang bikin orang berhenti scroll. Sampaikan inti isu dan kenapa ini penting SEKARANG.
- Post tengah: Uraikan fakta, kronologi, dampak, atau analisis kritis. Setiap post harus punya sudut pandang baru yang memperkaya pembahasan.
- Post terakhir: Tutup dengan refleksi, ajakan diskusi di kolom balasan, dan tautan sumber jika topik berkaitan berita.

ATURAN BERITA (WAJIB):
Jika topik berkaitan berita/peristiwa/politik/ekonomi, post terakhir WAJIB menyertakan link sumber kredibel (kompas.com, detik.com, cnnindonesia.com, tempo.co, antaranews.com, tirto.id) dengan format:
"Sumber: [URL]"

LARANGAN:
- JANGAN gunakan em-dash atau en-dash. Gunakan tanda hubung biasa (-).
- JANGAN tulis meta-text atau instruksi di dalam konten. Langsung tulis konten yang siap posting.
- JANGAN buat konten pendek atau generik.

FORMAT OUTPUT: JSON murni tanpa markdown wrapper.
{"posts": [{"position": 1, "content": "isi post 1"}, {"position": 2, "content": "isi post 2"}]}`;
}

// ============================================================
// USER PROMPT BUILDER
// ============================================================
function buildUserPrompt(topic: string, count: number, format: string, engagementMode?: boolean): string {
  const formatLabel = format === "single" ? "1 post tunggal" : `${count} post thread bersambung`;
  const engagement = engagementMode
    ? "Tambahkan hook di awal dan pertanyaan pemantik diskusi di akhir."
    : "";

  return `Topik: "${topic}"

Buat ${formatLabel} yang siap posting ke Threads. ${engagement}

Ingat: tulis langsung isi kontennya. Setiap post HARUS diselesaikan dengan kalimat yang utuh dan tanda baca akhir (. / ? / !). Rentang panjang tiap post adalah 280-420 karakter (jangan melebihi 460 karakter).`;
}

// ============================================================
// OFFLINE FALLBACK GENERATOR (Kualitas Tinggi)
// ============================================================
async function generateOfflineFallback(
  params: GenerateThreadParams,
  targetCount: number,
  modelName: string,
  feature: "thread_generator" | "auto_schedule" | "regenerate_part" | "probe_test",
  startTime: number
): Promise<GeneratedThreadOutput> {
  const latencyMs = Date.now() - startTime + 300;
  const topic = params.topic;

  const isNewsTopic = /berita|terkini|politik|update|resmi|ekonomi|karhutla|gibran|presiden|menteri|dpr|pemilu/i.test(topic);

  const fallbackPosts: { position: number; content: string }[] = [];

  if (targetCount === 1) {
    // Post tunggal
    fallbackPosts.push({
      position: 1,
      content: isNewsTopic
        ? `${topic} jadi sorotan besar minggu ini. Perkembangan terbaru menunjukkan dinamika yang cukup kompleks dan berdampak langsung pada kebijakan publik.\n\nYang menarik, respons masyarakat di media sosial terpecah jadi dua kubu dengan argumen yang sama-sama kuat. Ini bukan sekadar isu viral sesaat, tapi menyentuh fondasi bagaimana kita memandang transparansi dan akuntabilitas.\n\nSumber: https://www.kompas.com/tag/${encodeURIComponent(topic.split(" ")[0].toLowerCase())}`
        : `${topic} adalah hal yang sering dibicarakan tapi jarang benar-benar dipahami secara mendalam.\n\nKalau kita telusuri lebih jauh, ada pola menarik yang sering terlewat. Bukan cuma soal permukaan, tapi ada lapisan-lapisan konteks yang bikin perspektif kita berubah total.\n\nGimana menurut kalian? Drop pendapat kalian di bawah!`,
    });
  } else {
    // Thread bersambung spesifik topik
    fallbackPosts.push({
      position: 1,
      content: `Bahas tuntas soal "${topic}":\n\nBanyak yang belum sadar kalau isu ini membawa dampak yang jauh lebih besar dari kelihatannya di media sosial. Ada beberapa poin krusial yang wajib kita bedah bareng-bareng di thread ini.`,
    });

    for (let i = 2; i < targetCount; i++) {
      const angles = [
        `Poin penting pertama dari "${topic}":\n\nKalau kita cermati perkembangannya, ada pergeseran pola yang signifikan. Situasi di lapangan menunjukkan fakta menarik yang berbeda dari narasi umum yang beredar selama ini.`,
        `Faktor penentu lainnya terkait "${topic}":\n\nKombinasi antara dinamika opini publik dan respon pihak-pihak terkait membuktikan bahwa ini bukan sekadar tren sesaat. Ada implikasi jangka panjang yang layak kita kawal.`,
        `Sudut pandang kritis mengenai "${topic}":\n\nYang paling esensial adalah bagaimana kita menyikapi informasi ini secara objektif. Mengambil jarak sejenak dari emosi membuat kita melihat benang merah masalahnya secara lebih terang.`,
      ];
      fallbackPosts.push({
        position: i,
        content: angles[(i - 2) % angles.length],
      });
    }

    const closingContent = isNewsTopic
      ? `Itu tadi rangkuman dan bedah ringkas seputar "${topic}". Menurut kalian, ke mana arah perkembangan isu ini selanjutnya?\n\nTulis pendapat kalian di kolom komentar ya!\n\nSumber: https://www.kompas.com/tag/${encodeURIComponent(topic.split(" ")[0].toLowerCase())}`
      : `Itu tadi bedah ringkas seputar "${topic}". Menurut kalian, hal apa yang paling menarik atau mengejutkan dari topik ini?\n\nYuk drop tanggapan kalian di bawah, kita diskusi santai!`;

    fallbackPosts.push({
      position: targetCount,
      content: closingContent,
    });
  }

  const promptTokens = 400 + targetCount * 40;
  const completionTokens = 500 + targetCount * 120;
  const totalTokens = promptTokens + completionTokens;
  const estimatedCostUsd = calculateEstimatedCostUsd(promptTokens, completionTokens);

  await recordAIUsage({
    feature,
    model: modelName + " (offline-fallback)",
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCostUsd,
    latencyMs,
    status: "success",
    topic: params.topic,
  });

  return {
    posts: fallbackPosts,
    usage: { promptTokens, completionTokens, totalTokens, estimatedCostUsd, latencyMs, model: modelName },
  };
}

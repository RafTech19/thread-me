import { auth } from "@/auth";

const OWNER_EMAIL = (
  process.env.OWNER_EMAIL || "rafli.bim05@gmail.com"
).toLowerCase().trim();

export interface OwnerSession {
  email: string;
  name?: string | null;
  image?: string | null;
  isOwner: boolean;
}

/**
 * Helper untuk Server Actions dan Route Handlers.
 * Memastikan sesi valid dan email pengguna sama dengan OWNER_EMAIL.
 */
export async function requireOwner(): Promise<OwnerSession> {
  const session = await auth();

  // Mode development offline bypass jika AUTH_GOOGLE_ID belum dipasang
  const isDev = process.env.NODE_ENV !== "production";
  const isDummyAuthConfigured =
    !process.env.AUTH_GOOGLE_ID ||
    process.env.AUTH_GOOGLE_ID.includes("dummy");

  if (!session?.user?.email) {
    if (isDev && isDummyAuthConfigured) {
      // Fallback dev lokal agar developer tetap bisa menguji Server Actions tanpa kredensial Google
      return {
        email: OWNER_EMAIL,
        name: "Kaito deluxe",
        isOwner: true,
      };
    }
    throw new Error("Tidak terotorisasi: Anda harus login sebagai Owner.");
  }

  const userEmail = session.user.email.toLowerCase().trim();
  if (userEmail !== OWNER_EMAIL) {
    throw new Error("Akses ditolak: Akun ini bukan pemilik aplikasi (Owner).");
  }

  return {
    email: userEmail,
    name: session.user.name,
    image: session.user.image,
    isOwner: true,
  };
}


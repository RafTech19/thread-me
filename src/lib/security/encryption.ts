import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const DEFAULT_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function getKey(): Buffer {
  const hexKey = process.env.ENCRYPTION_KEY || DEFAULT_KEY;
  return Buffer.from(hexKey.slice(0, 64), "hex");
}

/**
 * Mengenkripsi token akses Threads menggunakan AES-256-GCM.
 * Format output: iv:authTag:encryptedData (dalam representasi hex)
 */
export function encryptToken(plainText: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12); // GCM standard IV 12 bytes
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Mendekripsi token akses Threads yang terenkripsi AES-256-GCM.
 */
export function decryptToken(encryptedString: string): string {
  const key = getKey();
  const parts = encryptedString.split(":");

  if (parts.length !== 3) {
    throw new Error("Format token terenkripsi tidak valid.");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}


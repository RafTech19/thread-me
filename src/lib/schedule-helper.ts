/**
 * Helper untuk menghitung jadwal eksekusi berikutnya dalam zona waktu WIB (UTC+7)
 */
export function computeNextRunAt(
  windowStart: string = "10:00",
  activeDays: number[] = [0, 1, 2, 3, 4, 5, 6],
  fromTime: Date = new Date()
): Date {
  const [startH, startM] = (windowStart || "10:00").split(":").map(Number);
  const hour = isNaN(startH) ? 10 : startH;
  const minute = isNaN(startM) ? 0 : startM;

  // Iterasi hingga 14 hari ke depan untuk menemukan slot hari aktif berikutnya
  for (let dayOffset = 0; dayOffset <= 14; dayOffset++) {
    // Geser waktu kandidat ke WIB (+7 jam)
    const candidateWib = new Date(
      fromTime.getTime() + 7 * 60 * 60 * 1000 + dayOffset * 24 * 60 * 60 * 1000
    );
    const dayOfWeek = candidateWib.getUTCDay();

    if (activeDays.includes(dayOfWeek)) {
      // Buat kandidat UTC dari jam & menit WIB (WIB = UTC+7 -> UTC = WIB - 7)
      const candidateUtc = new Date(
        Date.UTC(
          candidateWib.getUTCFullYear(),
          candidateWib.getUTCMonth(),
          candidateWib.getUTCDate(),
          hour - 7,
          minute,
          0,
          0
        )
      );

      // Pastikan waktu eksekusi berada di masa depan
      if (candidateUtc.getTime() > fromTime.getTime() + 60 * 1000) {
        return candidateUtc;
      }
    }
  }

  // Fallback jika tidak ditemukan: 24 jam dari sekarang
  return new Date(fromTime.getTime() + 24 * 60 * 60 * 1000);
}

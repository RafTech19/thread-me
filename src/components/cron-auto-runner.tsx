"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * CronAutoRunner
 * Komponen auto-runner sisi browser yang berjalan di background aplikasi.
 * Setiap kali tab ThreadMe dibuka, komponen ini secara berkala mengecek
 * apakah ada postingan terjadwal atau jadwal otomatis yang jatuh tempo.
 */
export function CronAutoRunner() {
  const router = useRouter();
  const isRunningRef = useRef(false);

  useEffect(() => {
    const runTick = async () => {
      if (isRunningRef.current) return;

      // Throttle: hindari spamming jika dipanggil berulang dalam 45 detik
      const lastTickStr = localStorage.getItem("threadme_last_client_tick");
      const lastTick = lastTickStr ? parseInt(lastTickStr, 10) : 0;
      const now = Date.now();

      if (now - lastTick < 45_000) {
        return;
      }

      isRunningRef.current = true;
      try {
        localStorage.setItem("threadme_last_client_tick", now.toString());

        const res = await fetch("/api/cron/tick?key=threadme_cron_secret_key_super_secure_random_string_123", {
          method: "GET",
          headers: {
            "x-cron-source": "client-heartbeat",
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.results) {
            const { publishedPosts, processedSchedules } = data.results;
            if (publishedPosts > 0 || processedSchedules > 0) {
              toast.success(
                `Otomasi aktif: ${publishedPosts} postingan baru berhasil dipublikasikan ke Threads (@kaitodex.19)!`,
                { duration: 5000 }
              );
              router.refresh();
            }
          }
        }
      } catch {
        // Silent background tick
      } finally {
        isRunningRef.current = false;
      }
    };

    // Jalankan pertama kali 2 detik setelah aplikasi dimuat di browser
    const initialTimer = setTimeout(() => {
      runTick();
    }, 2000);

    // Jalankan secara periodik setiap 60 detik selama tab aplikasi terbuka
    const interval = setInterval(runTick, 60_000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [router]);

  return null;
}

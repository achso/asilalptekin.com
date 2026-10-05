"use client";

import { useEffect, useState } from "react";

/** Current wall-clock time in Munich (Europe/Berlin), as minutes since midnight. */
function munichMinutesNow(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return { minutes: h * 60 + m, label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}` };
}

/** Is the remote expert online right now (before the 15:00 Munich cutoff)? */
export function isExpertOnline(now = new Date(), cutoffHour = 15) {
  return munichMinutesNow(now).minutes < cutoffHour * 60;
}

/**
 * How long until the Munich expert goes offline (15:00 CET/CEST).
 * Returns null on the server to avoid hydration mismatch.
 */
export function useMunichCutoff(cutoffHour = 15) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!now) return null;
  const { minutes, label } = munichMinutesNow(now);
  const remaining = cutoffHour * 60 - minutes;
  const online = remaining > 0;
  const h = Math.floor(Math.max(remaining, 0) / 60);
  const m = Math.max(remaining, 0) % 60;
  return {
    online,
    munichTime: label,
    remainingLabel: online ? (h > 0 ? `${h}h ${m}m left` : `${m}m left`) : "Offline · next 08:00",
    urgent: online && remaining <= 60,
  };
}

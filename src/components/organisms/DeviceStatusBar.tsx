"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fake iPadOS status bar, so the browser prototype feels like a native app.
 * Triple-tapping the clock fires `onSecretTap` (opens presenter dev tools on
 * an iPad, where there's no keyboard shortcut).
 */
export function DeviceStatusBar({ onSecretTap }: { onSecretTap?: () => void }) {
  const [time, setTime] = useState("");
  const taps = useRef<number[]>([]);

  useEffect(() => {
    const fmt = () =>
      setTime(
        new Date().toLocaleString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
      );
    fmt();
    const t = setInterval(fmt, 30_000);
    return () => clearInterval(t);
  }, []);

  const onClockTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 600), now];
    if (taps.current.length >= 3) {
      taps.current = [];
      onSecretTap?.();
    }
  };

  return (
    <div className="flex h-7 items-center justify-between px-6 text-[13px] font-semibold">
      <span suppressHydrationWarning onClick={onClockTap} className="-mx-2 px-2 py-1">
        {time}
      </span>
      <span className="flex items-center gap-2" aria-hidden>
        <span className="text-[12px]">4G</span>
        <span>62%</span>
        <span className="relative h-[11px] w-[22px] rounded-[3px] border border-black/60 p-px">
          <span className="block h-full w-[62%] rounded-[1px] bg-black" />
        </span>
      </span>
    </div>
  );
}

"use client";

import { useSyncExternalStore } from "react";

/**
 * Expert availability: the ONE source for every time string in the app
 * (top bar, form, cards, the expert's ticket). The remote expert in Munich
 * works 08:00–15:00 Europe/Berlin. Everything is derived from one shared
 * clock, so the header, the form and a sent card can never disagree
 * (UX audit #4).
 */
export const EXPERT_HOURS = { start: 8, end: 15 } as const;

/** Wall-clock time in Munich (Europe/Berlin), as minutes since midnight. */
function munichMinutes(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

/** "40 more minutes", "1 more hour", "2 h 5 min more". */
function duration(mins: number) {
  if (mins < 60) return `${mins} more minute${mins === 1 ? "" : "s"}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h} more hour${h === 1 ? "" : "s"}`;
  return `${h} h ${m} min more`;
}

export type ExpertAvailability = {
  online: boolean;
  /** Minutes until 15:00 while online, else 0. */
  minutesLeft: number;
  /** Top bar pill. */
  pill: string;
  /** Form, next to the priority choice. */
  formLine: string;
  /** Sent card, under the status: when the expert will see it. */
  seenLine: string;
  /** The ticket's deadline, from the contractor's priority. */
  deadline: (blocked: boolean) => string;
};

export function expertAvailability(now = new Date()): ExpertAvailability {
  const t = munichMinutes(now);
  const start = EXPERT_HOURS.start * 60;
  const end = EXPERT_HOURS.end * 60;
  const online = t >= start && t < end;
  const minutesLeft = online ? end - t : 0;
  // Before 08:00 the expert is back today; after 15:00, tomorrow.
  const day = t < start ? "today" : "tomorrow";
  const Day = day === "today" ? "Today" : "Tomorrow";
  return {
    online,
    minutesLeft,
    pill: online ? `Remote expert · available for ${duration(minutesLeft)}` : `Remote expert · back at 08:00 ${day}`,
    formLine: online ? `Expert available for ${duration(minutesLeft)}` : `Expert is back at 08:00 ${day}`,
    seenLine: online ? `Expert available for ${duration(minutesLeft)}` : `Expert sees it at 08:00 ${day}`,
    deadline: (blocked) =>
      blocked
        ? online
          ? "Today before 15:00 · work is stopped"
          : `${Day} by 10:00 · work is stopped`
        : "Within 2 working days · work continues",
  };
}

/** "16:19", in Munich time: every clock in the app (cards, status bar) uses it. */
export const munichClock = (ts: number | Date) =>
  new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });

/** "Mon, 5 Oct, 16:19" in Munich time (the device status bar). */
export const munichDateTime = (ts: number | Date) =>
  new Date(ts).toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Europe/Berlin",
  });

/** Is the remote expert online right now? */
export const isExpertOnline = (now = new Date()) => expertAvailability(now).online;

// One shared clock for every subscriber (ticks every 30 s).
let snapshot: ExpertAvailability | null = null;
const listeners = new Set<() => void>();
let timer: number | undefined;
function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) {
    snapshot = expertAvailability();
    timer = window.setInterval(() => {
      snapshot = expertAvailability();
      listeners.forEach((l) => l());
    }, 30_000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}
const getSnapshot = () => snapshot ?? (snapshot = expertAvailability());
const getServerSnapshot = () => null;

/** The expert's availability, live. null during server render (no hydration mismatch). */
export function useExpertAvailability(): ExpertAvailability | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

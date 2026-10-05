"use client";

import { useSyncExternalStore } from "react";

/**
 * Expert availability: the ONE source for every time string in the app
 * (top bar, form, cards, the expert's ticket). The remote expert in Munich
 * works 08:00–15:00 Europe/Berlin, Monday to Friday. Everything is derived from one shared
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
  /** Form, under the priority choice. */
  formLine: string;
  /** Sent card, under the status: when the expert will see it. */
  seenLine: string;
  /**
   * What the contractor can expect, from their priority. States only what is
   * known (the expert's hours), never a promised response time (UX audit r2).
   */
  priorityLine: (blocked: boolean) => string;
  /** Blocked after hours: they don't need to wait on site. */
  leaveNote: (blocked: boolean) => string | null;
  /** The expert's ticket row: how urgent, true whenever it's opened. */
  urgency: (blocked: boolean, since: number) => string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Day of week in Munich, 0 = Sunday. */
function munichWeekday(now: Date) {
  const w = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", weekday: "short" }).format(now);
  return Math.max(0, WEEKDAYS.indexOf(w));
}

/** Munich calendar date as YYYY-MM-DD (to compare days). */
const munichDay = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

export function expertAvailability(now = new Date()): ExpertAvailability {
  const t = munichMinutes(now);
  const wd = munichWeekday(now);
  const workday = wd >= 1 && wd <= 5;
  const start = EXPERT_HOURS.start * 60;
  const end = EXPERT_HOURS.end * 60;
  const online = workday && t >= start && t < end;
  const minutesLeft = online ? end - t : 0;
  // The next 08:00 the expert works: today (a weekday before 08:00), else the
  // next working day: "tomorrow" (Mon–Thu evening) or "Monday" (weekend).
  const nextWorkday = (from: number) => {
    let d = (from + 1) % 7;
    let n = 1;
    while (d === 0 || d === 6) {
      d = (d + 1) % 7;
      n++;
    }
    return n === 1 ? "tomorrow" : FULL_DAYS[d];
  };
  const back = workday && t < start ? "today" : nextWorkday(wd);
  const backAt = `08:00 ${back}`;
  const morning = back === "today" ? "this morning" : `${back} morning`;
  return {
    online,
    minutesLeft,
    pill: online ? `Remote expert · available for ${duration(minutesLeft)}` : `Remote expert · back at ${backAt}`,
    formLine: online ? `Expert available for ${duration(minutesLeft)}` : `Expert is back at ${backAt}`,
    seenLine: online ? `Expert available for ${duration(minutesLeft)}` : `Expert sees it at ${backAt}`,
    priorityLine: (blocked) =>
      !blocked
        ? "No rush · work continues"
        : online
          ? minutesLeft > 30
            ? "Asking for an answer today · expert is in until 15:00"
            : `Expert leaves in ${minutesLeft} min · may be answered ${nextWorkday(wd)} from 08:00`
          : `Expert sees this first at ${backAt} · work is stopped`,
    leaveNote: (blocked) =>
      blocked && !online ? `You can leave. The answer comes to this iPad ${morning}.` : null,
    urgency: (blocked, since) => {
      if (!blocked) return "Not blocking";
      const s = new Date(since);
      const days = Math.round((Date.parse(munichDay(now)) - Date.parse(munichDay(s))) / 86_400_000);
      const when = days <= 0 ? "" : days === 1 ? " yesterday" : ` ${FULL_DAYS[munichWeekday(s)]}`;
      return `Work stopped since ${munichClock(s)}${when}`;
    },
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

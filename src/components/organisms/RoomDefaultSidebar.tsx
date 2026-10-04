"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronRight, ChevronsUpDown, Info, MapPin, Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * RoomDefaultSidebar (organism)
 *
 * The sidebar's baseline state when nothing is selected: magicplan's
 * room-level Details panel (statistics, dimensions, affected areas, general).
 * Header and tabs stay put; the content below scrolls on its own.
 *
 * When the room has unresolved escalations (`escalationCount > 0`), a
 * high-visibility warning sits above Statistics, so a contractor opening the
 * room sees the blocker before the numbers. "View on plan" selects the
 * affected element, which brings up its EscalationCard in the inspector.
 */

export type RoomStat = { value: string; label: string };
export type RoomDefaultSidebarProps = {
  roomName?: string;
  floor?: string;
  roomType?: string;
  stats?: RoomStat[];
  ceilingHeight?: string;
  livingAreaPct?: number;
  /** Unresolved escalations in this room; > 0 shows the warning module. */
  escalationCount?: number;
  /** "View on plan": select the affected element on the canvas. */
  onViewOnPlan?: () => void;
  onClose?: () => void;
  className?: string;
};

const DEFAULT_STATS: RoomStat[] = [
  { value: "4.72 m²", label: "Floor Area" },
  { value: "23.92 m²", label: "Wall Area" },
  { value: "6.76 m", label: "Perimeter" },
  { value: "14.79 m³", label: "Volume" },
];

const TABS = ["Details", "Photos & Notes", "Forms"] as const;
type Tab = (typeof TABS)[number];

export function RoomDefaultSidebar({
  roomName = "Other",
  floor = "5th Floor",
  roomType = "Other",
  stats = DEFAULT_STATS,
  ceilingHeight = "3.13 m",
  livingAreaPct = 100,
  escalationCount = 0,
  onViewOnPlan,
  onClose,
  className,
}: RoomDefaultSidebarProps) {
  const [tab, setTab] = useState<Tab>("Details");

  return (
    <section
      aria-label={`${roomName} details`}
      className={cn("flex h-full w-[350px] flex-col bg-mp-panel text-mp-ink", className)}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-5 pb-3 pt-4">
        <span className="grid size-10 place-items-center rounded-xl bg-[#e6e6e9]" aria-hidden>
          <Info size={21} strokeWidth={2} />
        </span>
        <h2 className="flex-1 truncate text-[19px] font-semibold">{roomName}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-10 place-items-center rounded-full bg-[#e6e6e9] text-[#6b6b70] active:bg-mp-line"
        >
          <X size={20} strokeWidth={2.25} />
        </button>
      </header>

      {/* ── Segmented control ──────────────────────────────────── */}
      <div role="tablist" aria-label="Room panels" className="mx-5 flex rounded-xl bg-[#e3e3e6] p-1">
        {TABS.map((t, i) => {
          const active = tab === t;
          const prevActive = i > 0 && tab === TABS[i - 1];
          return (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t)}
              className="relative h-10 flex-1 rounded-lg text-[14px] font-medium"
            >
              {active && (
                <motion.span
                  layoutId="room-default-tab"
                  className="absolute inset-0 rounded-lg bg-white shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              {/* iOS-style hairline between inactive segments */}
              {i > 0 && !active && !prevActive && (
                <span className="absolute inset-y-2.5 left-0 w-px bg-[#c8c8cc]" aria-hidden />
              )}
              <span className="relative">{t}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 h-px bg-mp-line" />

      {/* ── Scrolling content ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-2">
        {tab === "Details" ? (
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {escalationCount > 0 && (
                <motion.div
                  key="escalations"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <ActiveEscalationsAlert count={escalationCount} onViewOnPlan={onViewOnPlan} />
                </motion.div>
              )}
            </AnimatePresence>

            <SectionHeader
              title="Statistics"
              action={
                <button type="button" className="text-[15px] font-semibold text-mp-blue">
                  See All
                </button>
              }
            />
            <dl className="grid grid-cols-4 divide-x divide-[#d6d6da] rounded-2xl bg-[#e9e9ec] py-3.5">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center px-1 text-center">
                  <dt className="order-2 mt-0.5 text-[11px] text-mp-muted">{s.label}</dt>
                  <dd className="order-1 whitespace-nowrap text-[15px] font-semibold tabular-nums">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>

            <SectionHeader title="Dimensions" />
            <Group>
              <Row label="Ceiling Height">
                <ValuePill>
                  {ceilingHeight}
                  <ChevronsUpDown size={15} className="text-mp-muted" />
                </ValuePill>
              </Row>
              <Row label="Living Area (%)">
                <ValuePill>{livingAreaPct}</ValuePill>
              </Row>
            </Group>

            <SectionHeader
              title={
                <span className="flex items-center gap-1.5">
                  Affected Areas
                  <span
                    role="img"
                    aria-label="Help"
                    title="Affected areas mark parts of a room or wall for exports."
                    className="grid size-[18px] place-items-center rounded-full bg-[#8e8e93] text-[12px] font-bold text-white"
                  >
                    ?
                  </span>
                </span>
              }
            />
            <button
              type="button"
              className="flex h-14 w-full items-center gap-3 rounded-2xl bg-white px-4 text-[17px] text-mp-blue active:bg-[#f0f0f2]"
            >
              <Plus size={22} strokeWidth={2} /> Add New Area
            </button>
            <p className="mt-2 px-1 text-[13px] leading-snug text-mp-muted">
              Define one or more affected areas (overlapping allowed) within a room or a wall.
              Affected areas can be included in your exports.
            </p>

            <SectionHeader title="General" />
            <Group>
              <Row label="Floor">
                <ValuePill>
                  {floor}
                  <ChevronRight size={16} className="text-mp-muted" />
                </ValuePill>
              </Row>
              <Row label="Room Type">
                <ValuePill>
                  {roomType}
                  <ChevronRight size={16} className="text-mp-muted" />
                </ValuePill>
              </Row>
              <Row label="Room Name">
                <ValuePill>{roomName}</ValuePill>
              </Row>
            </Group>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-white p-4 text-[14px] text-mp-muted">
            {tab === "Photos & Notes"
              ? "No photos or notes yet. Something wrong on site? Tap the wall, corner or floor, then Report Deviation."
              : "No forms attached to this room."}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Parts ───────────────────────────────────────────────────────────────────

/** High-visibility "this room is blocked" warning, shown before the statistics. */
function ActiveEscalationsAlert({
  count,
  onViewOnPlan,
}: {
  count: number;
  onViewOnPlan?: () => void;
}) {
  return (
    <div
      role="alert"
      className="mt-4 rounded-r-xl border-l-4 border-red-500 bg-red-50 py-3 pl-3.5 pr-3"
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-red-700">Active Escalations ({count})</p>
          <p className="mt-0.5 text-[13px] leading-snug text-red-900/80">
            Execution blocked pending remote expert review.
          </p>
          {onViewOnPlan && (
            <button
              type="button"
              onClick={onViewOnPlan}
              className="-ml-1 mt-1.5 flex h-9 items-center gap-1 rounded-md px-1 text-[14px] font-semibold text-red-700 underline-offset-2 active:underline"
            >
              <MapPin size={15} strokeWidth={2.5} aria-hidden /> View on plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, action }: { title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-center justify-between px-1 first:mt-4">
      <h3 className="text-[15px] font-semibold text-mp-muted">{title}</h3>
      {action}
    </div>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="divide-y divide-mp-line overflow-hidden rounded-2xl bg-white">{children}</div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex h-14 items-center justify-between gap-3 px-4">
      <span className="text-[16px]">{label}</span>
      {children}
    </div>
  );
}

function ValuePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg bg-[#f0f0f2] px-3 py-1.5 text-[15px] tabular-nums">
      {children}
    </span>
  );
}

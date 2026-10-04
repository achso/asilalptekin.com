"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ChevronsUpDown, Info, Lock, Plus, X } from "lucide-react";
import { useState } from "react";
import { EscalationCard, type EscalationCardProps } from "@/components/molecules/EscalationCard";
import { cn } from "@/lib/utils";

/**
 * RoomDefaultSidebar (organism)
 *
 * The sidebar's baseline state when nothing is selected: magicplan's
 * room-level Details panel. Header and tabs stay put; the content scrolls.
 *
 * Escalations come first. If the room has unresolved reports, their full
 * EscalationCards (photo, issue, status, Revoke) render at the top of the
 * Details tab, with no intermediate "View on plan" step. While anything is
 * escalated, the room properties below are shown read-only (padlocks, muted),
 * because the plan is blocked until the expert responds.
 */

export type RoomStat = { value: string; label: string };
export type RoomEscalation = EscalationCardProps & { id: string };

export type RoomDefaultSidebarProps = {
  roomName?: string;
  floor?: string;
  roomType?: string;
  stats?: RoomStat[];
  ceilingHeight?: string;
  livingAreaPct?: number;
  /** Unresolved escalations in this room, newest first. Empty = idle. */
  escalations?: RoomEscalation[];
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
  escalations = [],
  onClose,
  className,
}: RoomDefaultSidebarProps) {
  const [tab, setTab] = useState<Tab>("Details");
  const locked = escalations.length > 0;

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
            {/* Escalations first: the full ticket, no click-through */}
            <AnimatePresence initial={false}>
              {locked && (
                <motion.section
                  key="escalations"
                  aria-label="Active escalations"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <SectionHeader
                    title={
                      <span className="flex items-center gap-2 text-mp-red">
                        Active Escalation{escalations.length > 1 ? `s (${escalations.length})` : ""}
                      </span>
                    }
                  />
                  <ul className="flex flex-col gap-3">
                    <AnimatePresence initial={false}>
                      {escalations.map(({ id, ...card }) => (
                        <motion.li
                          key={id}
                          layout
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                        >
                          <EscalationCard {...card} />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Room properties: read-only while the plan is blocked */}
            <SectionHeader
              title="Statistics"
              action={
                <button type="button" className="text-[15px] font-semibold text-mp-blue">
                  See All
                </button>
              }
            />
            <dl
              className={cn(
                "grid grid-cols-4 divide-x divide-[#d6d6da] rounded-2xl bg-[#e9e9ec] py-3.5 transition-opacity",
                locked && "opacity-60",
              )}
            >
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center px-1 text-center">
                  <dt className="order-2 mt-0.5 text-[11px] text-mp-muted">{s.label}</dt>
                  <dd className="order-1 whitespace-nowrap text-[15px] font-semibold tabular-nums">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>

            <SectionHeader title="Dimensions" locked={locked} />
            <Group>
              <Row label="Ceiling Height" locked={locked}>
                <ValuePill locked={locked}>
                  {ceilingHeight}
                  {!locked && <ChevronsUpDown size={15} className="text-mp-muted" />}
                </ValuePill>
              </Row>
              <Row label="Living Area (%)" locked={locked}>
                <ValuePill locked={locked}>{livingAreaPct}</ValuePill>
              </Row>
            </Group>

            <SectionHeader
              locked={locked}
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
              disabled={locked}
              className="flex h-14 w-full items-center gap-3 rounded-2xl bg-white px-4 text-[17px] text-mp-blue active:bg-[#f0f0f2] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={22} strokeWidth={2} /> Add New Area
            </button>
            <p className="mt-2 px-1 text-[13px] leading-snug text-mp-muted">
              Define one or more affected areas (overlapping allowed) within a room or a wall.
              Affected areas can be included in your exports.
            </p>

            <SectionHeader title="General" locked={locked} />
            <Group>
              <Row label="Floor" locked={locked}>
                <ValuePill locked={locked}>
                  {floor}
                  {!locked && <ChevronRight size={16} className="text-mp-muted" />}
                </ValuePill>
              </Row>
              <Row label="Room Type" locked={locked}>
                <ValuePill locked={locked}>
                  {roomType}
                  {!locked && <ChevronRight size={16} className="text-mp-muted" />}
                </ValuePill>
              </Row>
              <Row label="Room Name" locked={locked}>
                <ValuePill locked={locked}>{roomName}</ValuePill>
              </Row>
            </Group>

            {locked && (
              <p className="mt-3 flex gap-2 px-1 text-[12px] leading-snug text-mp-muted">
                <Lock size={13} className="mt-0.5 shrink-0" aria-hidden />
                Room properties are read-only until the remote expert resolves the escalation.
              </p>
            )}
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

function SectionHeader({
  title,
  action,
  locked,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  locked?: boolean;
}) {
  return (
    <div className="mb-2 mt-6 flex items-center justify-between px-1 first:mt-4">
      <h3 className="flex items-center gap-1.5 text-[15px] font-semibold text-mp-muted">
        {title}
        {locked && <Lock size={12} aria-label="Read-only" />}
      </h3>
      {action}
    </div>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="divide-y divide-mp-line overflow-hidden rounded-2xl bg-white">{children}</div>
  );
}

function Row({
  label,
  locked,
  children,
}: {
  label: string;
  locked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-readonly={locked || undefined}
      className={cn("flex h-14 items-center justify-between gap-3 px-4", locked && "text-mp-muted")}
    >
      <span className="text-[16px]">{label}</span>
      {children}
    </div>
  );
}

function ValuePill({ locked, children }: { locked?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-lg bg-[#f0f0f2] px-3 py-1.5 text-[15px] tabular-nums",
        locked && "opacity-60",
      )}
    >
      {children}
      {locked && <Lock size={12} aria-hidden />}
    </span>
  );
}

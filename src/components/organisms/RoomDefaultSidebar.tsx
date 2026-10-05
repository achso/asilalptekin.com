"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info, Lock, Plus, X } from "lucide-react";
import { useState } from "react";
import { SegmentedControl } from "@/components/atoms/SegmentedControl";
import { Switch } from "@/components/atoms/Switch";
import { EscalationCard, type EscalationCardProps } from "@/components/molecules/EscalationCard";
import { PhotoEvidenceCapture } from "@/components/molecules/PhotoEvidenceCapture";
import { PROJECT, ROOM } from "@/lib/floorplan";
import type { ElementMedia } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * RoomDefaultSidebar (organism)
 *
 * The sidebar's baseline state when nothing is selected: magicplan's
 * room-level Details panel (here the "Music Room"). Header and tabs stay put;
 * the content scrolls.
 *
 * Execution phase: the permit is approved and the budget locked, so every
 * property is read-only, always. No steppers, no chevrons, disabled inputs and
 * switch, Add New Area disabled. Changes are proposed from the plan itself
 * (the 4.55 dimension, or Insert), not from this panel.
 *
 * Unresolved escalations render as full EscalationCards at the top of the
 * Details tab (photo, status, Revoke), with no extra click to reach them.
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
  /** Unresolved escalations in this room, newest first. */
  escalations?: RoomEscalation[];
  /** Photos & Notes tab content. Uncontrolled (local state) if omitted. */
  media?: ElementMedia;
  onMediaChange?: (m: ElementMedia) => void;
  onClose?: () => void;
  className?: string;
};

const DEFAULT_STATS: RoomStat[] = [
  { value: ROOM.stats.floorArea, label: "Floor Area" },
  { value: ROOM.stats.wallArea, label: "Wall Area" },
  { value: ROOM.stats.perimeter, label: "Perimeter" },
  { value: ROOM.stats.volume, label: "Volume" },
];

const TABS = ["Details", "Photos & Notes", "Forms"] as const;
type Tab = (typeof TABS)[number];

export function RoomDefaultSidebar({
  roomName = PROJECT.room,
  floor = PROJECT.floor,
  roomType = PROJECT.room,
  stats = DEFAULT_STATS,
  ceilingHeight = ROOM.stats.ceilingHeight,
  livingAreaPct = 100,
  escalations = [],
  media: mediaProp,
  onMediaChange,
  onClose,
  className,
}: RoomDefaultSidebarProps) {
  const [tab, setTab] = useState<Tab>("Details");
  const [localMedia, setLocalMedia] = useState<ElementMedia>({ photos: [], note: "" });
  const media = mediaProp ?? localMedia;
  const setMedia = onMediaChange ?? setLocalMedia;

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

      <SegmentedControl label="Room panels" options={TABS} value={tab} onChange={setTab} className="mx-5" />
      <div className="mt-3 h-px bg-mp-line" />

      {/* ── Scrolling content ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-2">
        {tab === "Details" ? (
          <div className="flex flex-col">
            {/* Escalations first: the full ticket, no click-through */}
            <AnimatePresence initial={false}>
              {escalations.length > 0 && (
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
                      <span className="text-mp-red">
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

            {/* ── Statistics (computed, read-only by nature) ─────── */}
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

            {/* ── Dimensions ─────────────────────────────────────── */}
            <SectionHeader title="Dimensions" />
            <Group>
              <Row label="Ceiling Height">
                {/* Read-only: plain value, no up/down stepper */}
                <ReadOnlyValue>{ceilingHeight}</ReadOnlyValue>
              </Row>
              <Row label="Living Area (%)">
                <DisabledInput label="Living Area (%)" value={String(livingAreaPct)} className="w-[150px]" />
              </Row>
            </Group>

            {/* ── Affected Areas ─────────────────────────────────── */}
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
              disabled
              aria-disabled="true"
              className="flex h-14 w-full cursor-not-allowed items-center gap-3 rounded-2xl bg-white px-4 text-[17px] text-mp-blue opacity-50"
            >
              <Plus size={22} strokeWidth={2} aria-hidden /> Add New Area
            </button>
            <p className="mt-2 px-1 text-[13px] leading-snug text-mp-muted">
              Define one or more affected areas (overlapping allowed) within a room or a wall.
              Affected areas can be included in your exports.
            </p>

            {/* ── General ─────────────────────────────────────────── */}
            <SectionHeader title="General" />
            <Group>
              <Row label="Floor">
                <ReadOnlyValue>{floor}</ReadOnlyValue>
              </Row>
              <Row label="Room Type">
                <ReadOnlyValue>{roomType}</ReadOnlyValue>
              </Row>
              <Row label="Room Name">
                <DisabledInput label="Room Name" value={roomName} className="w-[180px]" />
              </Row>
              <Row label="Room Color">
                <span
                  role="switch"
                  aria-checked="false"
                  aria-disabled="true"
                  aria-label="Room Color (disabled)"
                  className="cursor-not-allowed opacity-60"
                >
                  {/* Darker track so the off/disabled switch stays visible on white */}
                  <Switch checked={false} className="bg-gray-300" />
                </span>
              </Row>
            </Group>

            {/* ── Locked-state note ───────────────────────────────── */}
            <p className="mt-5 flex gap-2 px-1 text-[12px] leading-snug text-mp-muted">
              <Lock size={14} className="mt-px shrink-0" aria-hidden />
              <span>
                Properties are read-only during the execution phase. If the site differs, tap the
                dimension on the plan or use Insert to propose a change to the remote expert.
              </span>
            </p>
          </div>
        ) : tab === "Photos & Notes" ? (
          <PhotoEvidenceCapture
            className="mt-4"
            photos={media.photos}
            onPhotosChange={(photos) => setMedia({ ...media, photos })}
            note={media.note}
            onNoteChange={(note) => setMedia({ ...media, note })}
          />
        ) : (
          <div className="mt-4 rounded-2xl bg-white p-4 text-[14px] text-mp-muted">
            No forms attached to this room.
          </div>
        )}
      </div>
    </section>
  );
}

// ── Parts ───────────────────────────────────────────────────────────────────

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
    <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-2" aria-readonly="true">
      <span className="shrink-0 text-[16px]">{label}</span>
      {children}
    </div>
  );
}

/** A value shown as text only: no stepper, no chevron, nothing to tap. */
function ReadOnlyValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg bg-[#f0f0f2] px-3 py-1.5 text-[15px] tabular-nums text-mp-ink">
      {children}
    </span>
  );
}

/** iOS-style text field in its disabled state. */
function DisabledInput({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      aria-label={label}
      value={value}
      disabled
      readOnly
      className={cn(
        "h-10 min-w-0 cursor-not-allowed rounded-lg bg-gray-100 px-3 text-[15px] text-gray-400 outline-none",
        className,
      )}
    />
  );
}

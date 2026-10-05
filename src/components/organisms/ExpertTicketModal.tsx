"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CORNERS,
  GHOST_ITEM_SIZE,
  PLAN_OBJECTS,
  PROJECT,
  PERMIT_TEXT,
  ROOM,
  WALLS,
  askLabel,
  cornerById,
  describeLine,
  issueLabel,
  lineLength,
  objectById,
  reportName,
} from "@/lib/floorplan";
import type { Escalation, Point } from "@/lib/types";
import { munichDateTime, useExpertAvailability } from "@/lib/useMunichCutoff";
import { STATUS_META } from "@/store/deviationMachine";

const RED = "#EF4444";

/**
 * ExpertTicketModal (organism): the card's chevron opens the ticket as the
 * remote expert receives it, read-only (UX audit #3). Plan snapshot with the
 * proposal drawn in red, the photo, the measured values, The Ask and the
 * urgency: everything someone who has never seen the room needs, without a call.
 */
export function ExpertTicketModal({
  escalation,
  onClose,
  onConfirm,
}: {
  escalation: Escalation | null;
  /** Close; in review mode this is "Back to edit" (the draft stays open). */
  onClose: () => void;
  /**
   * Review mode: the same ticket shown before Send, so the contractor checks
   * exactly what the expert will get. Confirm sends it.
   */
  onConfirm?: () => void;
}) {
  useEffect(() => {
    if (!escalation) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [escalation, onClose]);

  return (
    <AnimatePresence>
      {escalation && (
        <motion.div
          key="ticket-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          className="absolute inset-0 z-[80] grid place-items-center bg-black/30 p-6"
          onPointerDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="flex max-h-full w-[960px] max-w-full flex-col overflow-hidden rounded-2xl bg-mp-panel shadow-2xl"
          >
            <Ticket e={escalation} onClose={onClose} onConfirm={onConfirm} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Ticket({ e, onClose, onConfirm }: { e: Escalation; onClose: () => void; onConfirm?: () => void }) {
  const review = !!onConfirm;
  const availability = useExpertAvailability();
  const name = reportName(e);
  const where = e.line ? describeLine(e.line) : null;
  const drawnM = e.line ? lineLength(e.line) : undefined;
  return (
    <>
      <header className="flex items-center gap-3 border-b border-mp-line bg-white px-5 py-3">
        <span className="grid size-10 place-items-center rounded-full bg-[#e6e6e9] text-mp-ink">
          <Eye size={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="ticket-title" className="text-[17px] font-semibold text-mp-ink">
            {review ? "Check before sending" : "What the expert receives"}
          </h2>
          <p className="text-[15px] text-mp-muted">
            {review ? "Not sent yet · this is what the expert will receive" : "Read-only"} · {name} report
            {!review && <> · {STATUS_META[e.status].label}</>}
          </p>
          {/* Which job, where, when: the job before the room (UX audit r2). */}
          <p data-ticket-context className="text-[15px] text-mp-ink">
            {PROJECT.name}, {PROJECT.address} · {PROJECT.floor}, {PROJECT.room} · {munichDateTime(e.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={review ? "Back to edit" : "Close"}
          className="grid size-10 place-items-center rounded-full bg-[#e6e6e9] text-[#6b6b70]"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[1.15fr_1fr] gap-4 overflow-y-auto p-5">
        {/* Plan snapshot with the proposal in red */}
        <section aria-label="Plan snapshot" className="flex flex-col gap-2">
          <h3 className="text-[15px] font-semibold text-mp-muted">Plan snapshot</h3>
          <div className="rounded-2xl bg-white p-3">
            <PlanSnapshot e={e} />
          </div>
          {where && (
            <p className="text-[15px] leading-snug text-mp-ink">{where.sentence}</p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <Photos urls={e.photoUrls} />

          <dl className="divide-y divide-mp-line overflow-hidden rounded-2xl bg-white text-[15px]">
            <Row label="Issue">
              {issueLabel(e.issueType)}
              {/* Name what it's about: "Dimension Mismatch · North wall". */}
              {e.category ? ` · ${e.category}` : e.target.type !== "ghost" && e.target.type !== "room" ? ` · ${e.targetLabel}` : ""}
            </Row>
            <Row label="Reported by">{PROJECT.reporter}</Row>
            <Row label="Measured">
              <MeasuredValues e={e} drawnM={drawnM} />
            </Row>
            <Row label="The ask" strong>
              {askLabel(e.ask) ?? "—"}
            </Row>
            {/* How urgent, stated as a fact that stays true whenever it's opened. */}
            <Row label="Urgency" strong={e.blocking}>
              {availability ? availability.urgency(e.blocking, e.createdAt) : e.blocking ? "Work stopped" : "Not blocking"}
            </Row>
            {e.note && <Row label="Note">“{e.note}”</Row>}
            {e.voiceMemo && (
              <Row label="Voice memo">
                <span className="tabular-nums">
                  {Math.floor(e.voiceMemo.durationS / 60)}:{String(e.voiceMemo.durationS % 60).padStart(2, "0")}
                </span>
                <span className="text-mp-muted">
                  {e.voiceMemo.transcribed ? " · transcribed into the note" : " · audio only, not transcribed"}
                </span>
              </Row>
            )}
            <Row label="Attached">Plan dimensions · Permit {PERMIT_TEXT}</Row>
          </dl>
        </section>
      </div>
      {review && (
        <footer className="flex items-center justify-end gap-3 border-t border-mp-line bg-white px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-xl border border-mp-line bg-white px-5 text-[15px] font-semibold text-mp-ink active:bg-gray-50"
          >
            Back to edit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-12 items-center gap-2 rounded-xl bg-mp-blue px-6 text-[15px] font-semibold text-white active:opacity-90"
          >
            <Send size={18} aria-hidden /> Send to expert
          </button>
        </footer>
      )}
    </>
  );
}

/** Every photo: the selected one large, all of them as thumbnails below (tap to view). */
function Photos({ urls }: { urls: string[] }) {
  const [shown, setShown] = useState(0);
  const current = urls[Math.min(shown, urls.length - 1)];
  return (
    <div>
      <h3 className="mb-2 text-[15px] font-semibold text-mp-muted">
        {urls.length > 1 ? `Photos (${urls.length})` : "Photo"}
      </h3>
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current}
          alt={`Evidence photo ${shown + 1} of ${urls.length}`}
          className="aspect-[4/3] w-full rounded-2xl object-cover"
        />
      ) : (
        <p className="text-[15px] text-mp-muted">No photo</p>
      )}
      {urls.length > 1 && (
        <ul aria-label="All photos" className="mt-2 grid grid-cols-5 gap-2">
          {urls.map((u, i) => (
            <li key={u + i}>
              <button
                type="button"
                onClick={() => setShown(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-pressed={i === shown}
                className={
                  i === shown
                    ? "block w-full overflow-hidden rounded-xl ring-2 ring-mp-blue ring-offset-2"
                    : "block w-full overflow-hidden rounded-xl opacity-80 active:opacity-100"
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="aspect-square w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({ label, children, strong }: { label: string; children: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex gap-3 px-4 py-2.5">
      <dt className="w-[92px] shrink-0 text-mp-muted">{label}</dt>
      <dd className={strong ? "min-w-0 flex-1 font-semibold text-mp-ink" : "min-w-0 flex-1 text-mp-ink"}>{children}</dd>
    </div>
  );
}

/** Measured against what the plan (or the drawing) says. */
function MeasuredValues({ e, drawnM }: { e: Escalation; drawnM?: number }) {
  if (e.objectChange) {
    const { from, to } = e.objectChange;
    const parts = (["widthM", "depthM", "heightM"] as const)
      .filter((k) => from[k] !== to[k])
      .map((k) => `${k[0].toUpperCase()} ${to[k].toFixed(2)} m (plan ${from[k].toFixed(2)})`);
    if (from.rotation !== to.rotation) parts.push(`turned ${to.rotation}° (plan ${from.rotation}°)`);
    if (Math.hypot(from.center.x - to.center.x, from.center.y - to.center.y) > 0.005) parts.push("moved (see plan)");
    return <>{parts.join(" · ") || "—"}</>;
  }
  if (e.measuredM === undefined) return <>—</>;
  const ref =
    e.plannedM !== undefined
      ? ` · plan ${e.plannedM.toFixed(2)} m (${signedCm(e.measuredM - e.plannedM)})`
      : e.lengthEstimated
        ? " · estimated from the drawing, not measured"
        : drawnM !== undefined
          ? " · measured on site"
          : "";
  return (
    <>
      <span className="font-semibold">{e.measuredM.toFixed(2)} m</span>
      <span className="text-mp-muted">{ref}</span>
    </>
  );
}

const signedCm = (d: number) => `${d >= 0 ? "+" : "−"}${Math.abs(Math.round(d * 100))} cm`;

// ── Plan snapshot ───────────────────────────────────────────────────────────

const PAD = 0.45;
const T = 0.12; // wall thickness in metres

/** The locked plan in metres (walls, objects), with the report drawn in red on top. */
function PlanSnapshot({ e }: { e: Escalation }) {
  const W = ROOM.widthM;
  const D = ROOM.depthM;
  const target = e.target;
  return (
    <svg
      viewBox={`${-PAD} ${-PAD} ${W + PAD * 2} ${D + PAD * 2}`}
      className="w-full"
      role="img"
      aria-label={`Plan of ${PROJECT.room} with the ${reportName(e).toLowerCase()} report drawn in red`}
    >
      <rect x={0} y={0} width={W} height={D} fill="#fff" />
      {/* plan objects */}
      {PLAN_OBJECTS.map((o) => (
        <rect
          key={o.id}
          x={-o.widthM / 2}
          y={-o.depthM / 2}
          width={o.widthM}
          height={o.depthM}
          transform={`translate(${o.center.x} ${o.center.y}) rotate(${o.rotation})`}
          fill="none"
          stroke="#9ca3af"
          strokeWidth={0.02}
        />
      ))}
      {/* walls */}
      {WALLS.map((w) => {
        const a = cornerById(w.from).p;
        const b = cornerById(w.to).p;
        const hit =
          target.type === "wall" && target.id === w.id
            ? e.issueType === "element-not-on-site"
              ? "remove"
              : "dimension"
            : null;
        return (
          <g key={w.id}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#111" strokeWidth={T} strokeLinecap="square" />
            {hit && (
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={RED}
                strokeWidth={T + 0.04}
                strokeDasharray={hit === "remove" ? "0.12 0.08" : undefined}
              />
            )}
          </g>
        );
      })}
      {/* doors and windows, so the expert can tell the ends of a wall apart */}
      {WALLS.flatMap((w) => (w.openings ?? []).map((o, i) => <Opening key={`${w.id}-${i}`} wallId={w.id} o={o} />))}
      {CORNERS.map((c) =>
        target.type === "corner" && target.id === c.id ? (
          <circle key={c.id} cx={c.p.x} cy={c.p.y} r={0.16} fill="none" stroke={RED} strokeWidth={0.04} strokeDasharray="0.08 0.05" />
        ) : null,
      )}

      {/* the proposal */}
      {e.line && (
        <g>
          <line
            x1={e.line.a.x}
            y1={e.line.a.y}
            x2={e.line.b.x}
            y2={e.line.b.y}
            stroke={RED}
            strokeWidth={0.05}
            strokeDasharray="0.14 0.09"
          />
          {[e.line.a, e.line.b].map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={0.06} fill="#fff" stroke={RED} strokeWidth={0.03} />
          ))}
          <Label at={lineLabelAt(e.line.a, e.line.b)} text={`${(e.measuredM ?? lineLength(e.line)).toFixed(2)} m`} />
        </g>
      )}
      {e.items?.map((it) => (
        <rect
          key={it.id}
          x={-GHOST_ITEM_SIZE.widthM / 2}
          y={-GHOST_ITEM_SIZE.depthM / 2}
          width={GHOST_ITEM_SIZE.widthM}
          height={GHOST_ITEM_SIZE.depthM}
          transform={`translate(${it.center.x} ${it.center.y}) rotate(${it.rotation})`}
          fill="rgba(239,68,68,0.12)"
          stroke={RED}
          strokeWidth={0.03}
          strokeDasharray="0.08 0.06"
        />
      ))}
      {!e.line && !e.items && e.marker && (
        <rect x={e.marker.x - 0.45} y={e.marker.y - 0.05} width={0.9} height={0.1} fill="rgba(239,68,68,0.12)" stroke={RED} strokeWidth={0.03} />
      )}
      {target.type === "object" &&
        (() => {
          const o = objectById(target.id);
          const to = e.objectChange?.to;
          const shown = to ?? o;
          return (
            <g transform={`translate(${shown.center.x} ${shown.center.y}) rotate(${shown.rotation})`}>
              <rect
                x={-shown.widthM / 2}
                y={-shown.depthM / 2}
                width={shown.widthM}
                height={shown.depthM}
                fill="rgba(239,68,68,0.12)"
                stroke={RED}
                strokeWidth={0.03}
                strokeDasharray="0.08 0.06"
              />
              {e.issueType === "element-not-on-site" && (
                <path
                  d={`M${-shown.widthM / 2} ${-shown.depthM / 2} L${shown.widthM / 2} ${shown.depthM / 2} M${shown.widthM / 2} ${-shown.depthM / 2} L${-shown.widthM / 2} ${shown.depthM / 2}`}
                  stroke={RED}
                  strokeWidth={0.03}
                />
              )}
            </g>
          );
        })()}
      {/* north arrow, so "runs north–south" reads on the snapshot too */}
      <g transform={`translate(${W + PAD * 0.55} ${-PAD * 0.45})`}>
        <path d="M0 -0.13 L0.07 0.06 L0 0.02 L-0.07 0.06 Z" fill="#6b6b70" />
        <text y={0.2} fontSize={0.13} textAnchor="middle" fill="#6b6b70">
          N
        </text>
      </g>
      {/* Plan sizes, for scale. On the disputed wall the red measured label
          takes the plan label's place instead of printing over it. */}
      {(["w-north", "w-west", "w-south", "w-east"] as const).map((id) => {
        const at = SIZE_LABEL_AT[id];
        const disputed = target.type === "wall" && target.id === id && e.issueType === "dimension-mismatch";
        const vertical = id === "w-west" || id === "w-east";
        if (disputed && e.measuredM !== undefined) {
          const plan = id === "w-north" || id === "w-south" ? W : D;
          return <Label key={id} at={at} vertical={vertical} text={`${e.measuredM.toFixed(2)} m (plan ${plan.toFixed(2)})`} />;
        }
        if (id === "w-south" || id === "w-east") return null; // one label per axis is enough
        return (
          <text
            key={id}
            x={at.x}
            y={at.y}
            fontSize={0.15}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#6b6b70"
            transform={vertical ? `rotate(-90 ${at.x} ${at.y})` : undefined}
          >
            {(vertical ? D : W).toFixed(2)} m
          </text>
        );
      })}
    </svg>
  );
}

/** Where each wall's size label sits, just outside the room. */
const SIZE_LABEL_AT: Record<"w-north" | "w-west" | "w-south" | "w-east", Point> = {
  "w-north": { x: ROOM.widthM / 2, y: -0.25 },
  "w-south": { x: ROOM.widthM / 2, y: ROOM.depthM + 0.25 },
  "w-west": { x: -0.25, y: ROOM.depthM / 2 },
  "w-east": { x: ROOM.widthM + 0.25, y: ROOM.depthM / 2 },
};

/** A door (gap + leaf + swing) or window (gap + glazing lines) on a wall, in metres. */
function Opening({ wallId, o }: { wallId: string; o: NonNullable<(typeof WALLS)[number]["openings"]>[number] }) {
  const w = WALLS.find((x) => x.id === wallId)!;
  const a = cornerById(w.from).p;
  const b = cornerById(w.to).p;
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const ux = (b.x - a.x) / len;
  const uy = (b.y - a.y) / len;
  const nx = -uy; // inward for a clockwise room
  const ny = ux;
  const p1 = { x: a.x + ux * o.offsetM, y: a.y + uy * o.offsetM };
  const p2 = { x: p1.x + ux * o.widthM, y: p1.y + uy * o.widthM };
  const gap = <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#fff" strokeWidth={T + 0.02} />;
  if (o.kind === "window") {
    return (
      <g>
        {gap}
        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#111" strokeWidth={0.02} />
        <line x1={p1.x - nx * 0.04} y1={p1.y - ny * 0.04} x2={p2.x - nx * 0.04} y2={p2.y - ny * 0.04} stroke="#111" strokeWidth={0.015} />
      </g>
    );
  }
  const leaf = { x: p2.x + nx * o.widthM, y: p2.y + ny * o.widthM };
  return (
    <g>
      {gap}
      <line x1={p2.x} y1={p2.y} x2={leaf.x} y2={leaf.y} stroke="#111" strokeWidth={0.02} />
      <path d={`M ${leaf.x} ${leaf.y} A ${o.widthM} ${o.widthM} 0 0 1 ${p1.x} ${p1.y}`} fill="none" stroke="#111" strokeWidth={0.015} />
    </g>
  );
}

function lineLabelAt(a: Point, b: Point) {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const nx = -(b.y - a.y) / len;
  const ny = (b.x - a.x) / len;
  return { x: (a.x + b.x) / 2 + nx * 0.3, y: (a.y + b.y) / 2 + ny * 0.3 };
}

function Label({ at, text, vertical }: { at: Point; text: string; vertical?: boolean }) {
  const w = text.length * 0.085 + 0.12;
  return (
    <g transform={vertical ? `rotate(-90 ${at.x} ${at.y})` : undefined}>
      <rect x={at.x - w / 2} y={at.y - 0.11} width={w} height={0.22} rx={0.04} fill="#fff" stroke={RED} strokeWidth={0.015} />
      <text x={at.x} y={at.y} fontSize={0.14} fontWeight={600} fill={RED} textAnchor="middle" dominantBaseline="central">
        {text}
      </text>
    </g>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, X } from "lucide-react";
import { useEffect } from "react";
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
import { useExpertAvailability } from "@/lib/useMunichCutoff";
import { STATUS_META } from "@/store/deviationMachine";

const RED = "#EF4444";

/**
 * ExpertTicketModal (organism): the card's chevron opens the ticket as the
 * remote expert receives it, read-only (UX audit #3). Plan snapshot with the
 * proposal drawn in red, the photo, the measured values, The Ask and the
 * deadline: everything someone who has never seen the room needs, without a call.
 */
export function ExpertTicketModal({ escalation, onClose }: { escalation: Escalation | null; onClose: () => void }) {
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
            <Ticket e={escalation} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Ticket({ e, onClose }: { e: Escalation; onClose: () => void }) {
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
            What the expert receives
          </h2>
          <p className="text-[15px] text-mp-muted">
            Read-only · {name} report · {PROJECT.floor}, {PROJECT.room} · {STATUS_META[e.status].label}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
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
            <p className="text-[15px] leading-snug text-mp-ink">
              <span className="font-semibold">Runs {where.runs}.</span> From {where.from} to {where.to}.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <h3 className="mb-2 text-[15px] font-semibold text-mp-muted">Photo</h3>
            {e.photoUrls[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.photoUrls[0]} alt="Evidence photo" className="aspect-[4/3] w-full rounded-2xl object-cover" />
            ) : (
              <p className="text-[15px] text-mp-muted">No photo</p>
            )}
          </div>

          <dl className="divide-y divide-mp-line overflow-hidden rounded-2xl bg-white text-[15px]">
            <Row label="Issue">
              {issueLabel(e.issueType)}
              {e.category && ` · ${e.category}`}
            </Row>
            <Row label="Measured">
              <MeasuredValues e={e} drawnM={drawnM} />
            </Row>
            <Row label="The ask" strong>
              {askLabel(e.ask) ?? "—"}
            </Row>
            <Row label="Deadline" strong={e.blocking}>
              {availability ? availability.deadline(e.blocking) : e.blocking ? "Work is stopped" : "Work continues"}
            </Row>
            {e.note && <Row label="Note">“{e.note}”</Row>}
            <Row label="Attached">Plan dimensions · Permit {PERMIT_TEXT}</Row>
          </dl>
        </section>
      </div>
    </>
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
      : drawnM !== undefined
        ? ` · drawn ${drawnM.toFixed(2)} m`
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
            {hit === "dimension" && e.measuredM !== undefined && (
              <Label at={mid(a, b, w.id === "w-north" ? -0.28 : 0.28)} text={`${e.measuredM.toFixed(2)} m (plan ${w.lengthM.toFixed(2)})`} />
            )}
          </g>
        );
      })}
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
      {/* plan size, for scale */}
      <text x={W / 2} y={-0.22} fontSize={0.15} textAnchor="middle" fill="#6b6b70">
        {W.toFixed(2)} m
      </text>
      <text x={-0.22} y={D / 2} fontSize={0.15} textAnchor="middle" fill="#6b6b70" transform={`rotate(-90 ${-0.22} ${D / 2})`}>
        {D.toFixed(2)} m
      </text>
    </svg>
  );
}

const mid = (a: Point, b: Point, off: number) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + off });

function lineLabelAt(a: Point, b: Point) {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const nx = -(b.y - a.y) / len;
  const ny = (b.x - a.x) / len;
  return { x: (a.x + b.x) / 2 + nx * 0.3, y: (a.y + b.y) / 2 + ny * 0.3 };
}

function Label({ at, text }: { at: Point; text: string }) {
  const w = text.length * 0.085 + 0.12;
  return (
    <g>
      <rect x={at.x - w / 2} y={at.y - 0.11} width={w} height={0.22} rx={0.04} fill="#fff" stroke={RED} strokeWidth={0.015} />
      <text x={at.x} y={at.y} fontSize={0.14} fontWeight={600} fill={RED} textAnchor="middle" dominantBaseline="central">
        {text}
      </text>
    </g>
  );
}

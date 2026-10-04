"use client";

import { useState } from "react";
import { CanvasWall, CanvasWallDefs } from "@/components/atoms/CanvasWall";
import { LockedBadge } from "@/components/atoms/LockedBadge";
import { StepLabel } from "@/components/atoms/StepLabel";
import { Switch } from "@/components/atoms/Switch";
import { ToolButton } from "@/components/atoms/ToolButton";
import { EscalationPin, EscalationPins } from "@/components/molecules/EscalationPin";
import { EscalationCard } from "@/components/molecules/EscalationCard";
import { ExpertAvailability } from "@/components/molecules/ExpertAvailability";
import { IssueTypePicker } from "@/components/molecules/IssueTypePicker";
import { NumericStepper } from "@/components/molecules/NumericStepper";
import { PhotoCapture, type PhotoValue } from "@/components/molecules/PhotoCapture";
import { ReportDeviationAction } from "@/components/molecules/ReportDeviationAction";
import { VoiceMemoToggle } from "@/components/molecules/VoiceMemoToggle";
import { RoomDefaultSidebar } from "@/components/organisms/RoomDefaultSidebar";
import { StatusToast } from "@/components/organisms/StatusToast";
import { DEMO_PHOTO } from "@/lib/demoPhoto";
import { WALL_THICKNESS, wallById, wallGeometry } from "@/lib/floorplan";
import { CANVAS_W, PANEL_W } from "@/lib/layout";
import type { Escalation, IssueType, SelectedElement } from "@/lib/types";
import type { DeviationState } from "@/store/deviationMachine";

/**
 * /sandbox: component kitchen sink (Storybook-style).
 * Every atom and molecule rendered in isolation, at real size, in each state.
 * Stateless where possible; a few molecules are wired to local state so they
 * can be poked. Nothing here touches the app store.
 */

// Fixed timestamps so specimens render identically on every load.
const REPORTED = new Date("2026-10-01T13:05:00").getTime();
const OPENED = new Date("2026-10-01T13:12:00").getTime();
/** Card width inside the 350px sidebar (minus its 20px padding each side). */
const CARD_W = PANEL_W - 40;

const NORTH_WALL: SelectedElement = { type: "wall", id: "w-north" };

export default function SandboxPage() {
  const [log, setLog] = useState<string[]>([]);
  const record = (msg: string) =>
    setLog((l) => [`${new Date().toLocaleTimeString("en-GB")}  ${msg}`, ...l].slice(0, 6));

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-50 p-8 text-mp-ink md:p-16">
      <div className="mx-auto max-w-[1100px]">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            magicplan · Field Escalation
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Component Sandbox</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Every UI component rendered in isolation, in each of its states. Interactive specimens
            log their callbacks at the bottom of the page.
          </p>
          <nav className="mt-5 flex flex-wrap gap-2 text-sm">
            {[
              ["#atoms", "Atoms"],
              ["#molecules", "Molecules"],
              ["#ui-elements", "UI Elements"],
              ["#organisms", "Organisms"],
              ["#log", "Event log"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 font-medium text-gray-700 hover:bg-gray-100"
              >
                {label}
              </a>
            ))}
          </nav>
        </header>

        {/* ════════════════════════════ ATOMS ════════════════════════════ */}
        <Section id="atoms" title="Atoms" description="Smallest building blocks. Purely presentational.">
          <Specimen
            title="CanvasWall"
            note="One wall segment. Variants come from the `deviationState` and `selected` props; colour changes are CSS transitions on stroke."
          >
            <CanvasWallStates />
          </Specimen>

          <Specimen title="ToolButton" note="`locked` keeps the button tappable so the app can explain why it's disabled.">
            <div className="flex flex-wrap items-center gap-3">
              <Labeled label="default">
                <ToolButton onClick={() => record("ToolButton (default) clicked")}>Add Wall</ToolButton>
              </Labeled>
              <Labeled label="locked">
                <ToolButton locked onClick={() => record("ToolButton (locked) clicked → show lock toast")}>
                  Add Wall
                </ToolButton>
              </Labeled>
              <Labeled label="locked · danger">
                <ToolButton locked tone="danger" onClick={() => record("ToolButton (danger) clicked")}>
                  Delete…
                </ToolButton>
              </Labeled>
            </div>
          </Specimen>

          <Specimen title="Switch & StepLabel">
            <div className="flex flex-wrap items-center gap-8">
              <Labeled label="Switch off">
                <Switch checked={false} />
              </Labeled>
              <Labeled label="Switch on">
                <Switch checked />
              </Labeled>
              <Labeled label="StepLabel pending">
                <StepLabel n={2} done={false}>
                  Photo
                </StepLabel>
              </Labeled>
              <Labeled label="StepLabel done">
                <StepLabel n={2} done>
                  Photo
                </StepLabel>
              </Labeled>
              <Labeled label="StepLabel optional">
                <StepLabel n={3} done={false} optional>
                  Voice memo
                </StepLabel>
              </Labeled>
            </div>
          </Specimen>
        </Section>

        {/* ═══════════════════════════ MOLECULES ═══════════════════════════ */}
        <Section id="molecules" title="Molecules" description="Atoms composed into a single unit of meaning.">
          <Specimen
            title="EscalationCard"
            note="Delivered shows the BLOCKING tag and Revoke. In review hides Revoke and shows the yellow “Expert is reviewing” badge."
          >
            <div className="flex flex-wrap gap-6">
              <SidebarBackdrop label='status="delivered"'>
                <EscalationCard
                  status="delivered"
                  issueType="dimension-mismatch"
                  timestamp={REPORTED}
                  statusChangedAt={REPORTED + 2_000}
                  targetLabel="North wall"
                  photoUrl={DEMO_PHOTO}
                  dimension={{ plannedM: 4.55, measuredM: 4.35 }}
                  onRevoke={() => record("EscalationCard onRevoke() — delivered")}
                />
              </SidebarBackdrop>
              <SidebarBackdrop label='status="in_review"'>
                <EscalationCard
                  status="in_review"
                  issueType="dimension-mismatch"
                  timestamp={REPORTED}
                  statusChangedAt={OPENED}
                  targetLabel="North wall"
                  photoUrl={DEMO_PHOTO}
                  dimension={{ plannedM: 4.55, measuredM: 4.35 }}
                  onRevoke={() => record("onRevoke() fired in review — should never happen")}
                />
              </SidebarBackdrop>
            </div>
          </Specimen>

          <Specimen title="IssueTypePicker" note="Radio group of large tiles: structured input instead of free text.">
            <IssueTypePickerDemo onChange={(v) => record(`IssueTypePicker → ${v}`)} />
          </Specimen>

          <div className="grid gap-6 md:grid-cols-2">
            <Specimen title="NumericStepper" note="± in 5 cm steps, with the difference from plan.">
              <NumericStepperDemo />
            </Specimen>
            <Specimen title="ExpertAvailability" note="Live countdown to 15:00 Europe/Berlin.">
              <ExpertAvailability />
            </Specimen>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Specimen title="PhotoCapture" note="Camera on iPad; demo photo on desktop. Optional caption once a photo is attached.">
              <PhotoCaptureDemo onChange={(v) => record(`PhotoCapture → ${v ? `photo${v.caption ? `, “${v.caption}”` : ""}` : "removed"}`)} />
            </Specimen>
            <Specimen title="VoiceMemoToggle" note="Tap to talk, tap to stop. Simulated if the mic is blocked.">
              <div style={{ width: CARD_W }}>
                <VoiceMemoToggle
                  onChange={(m) => m && record(`VoiceMemoToggle → ${m.durationS}s memo`)}
                />
              </div>
            </Specimen>
          </div>
        </Section>

        {/* ══════════════════════════ UI ELEMENTS ══════════════════════════ */}
        <Section
          id="ui-elements"
          title="UI Elements"
          description="Actions, badges and feedback: the pieces that carry the escalation flow."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Specimen
              title="ReportDeviationAction"
              note="Sole entry point, top of the LeftToolbar. Only rendered when an element is selected and it is idle (or resolved)."
            >
              <div className="flex flex-wrap items-end gap-6">
                <Labeled label="selectedElement = wall">
                  <ReportDeviationAction
                    selectedElement={NORTH_WALL}
                    deviationState="idle"
                    onReport={(a) => record(`onReport(${JSON.stringify(a)})`)}
                  />
                </Labeled>
                <Labeled label="selectedElement = null">
                  <div className="flex h-14 items-center rounded-xl border border-dashed border-gray-300 px-4 text-xs text-gray-400">
                    renders nothing
                    <ReportDeviationAction
                        selectedElement={null}
                      deviationState="idle"
                      onReport={() => undefined}
                    />
                  </div>
                </Labeled>
              </div>
            </Specimen>

            <Specimen title="LockedBadge" note="Top bar: plan is in execution state, geometry read-only.">
              <LockedBadge />
            </Specimen>
          </div>

          <Specimen
            title="EscalationPin"
            note="Compact status marker: a 24px disc inside a 44px touch target. Replaces the wide text pill so several reports stay legible."
          >
            <div className="flex flex-wrap items-center gap-8">
              {(["delivered", "in_review", "resolved"] as const).map((status) => (
                <Labeled key={status} label={`status="${status}"`}>
                  <div className="flex items-center gap-2 rounded-xl bg-mp-canvas px-3 py-1">
                    <EscalationPin
                      status={status}
                      label="North wall"
                      onPress={() => record(`EscalationPin (${status}) pressed → select wall`)}
                    />
                  </div>
                </Labeled>
              ))}
            </div>
          </Specimen>

          <Specimen
            title="In context: pin on an escalated wall"
            note="EscalationPins at real canvas coordinates: centred on the wall, over its red hatch."
          >
            <div className="flex flex-col gap-6">
              <MiniCanvas label="delivered · EscalationPin" wallState="delivered">
                <EscalationPins
                  escalations={[MOCK_ESCALATION]}
                  onPress={() => record("EscalationPin pressed → select wall")}
                />
              </MiniCanvas>
            </div>
          </Specimen>

          <Specimen
            title="StatusToast"
            note="Normally pinned above the canvas bottom; shown here in normal flow. Event toasts win over the idle hint."
          >
            <div className="flex flex-col items-start gap-3">
              <Labeled label="idle hint (nothing selected)">
                <InFlowToast showHint />
              </Labeled>
              <Labeled label='tone="success"'>
                <InFlowToast toast={{ id: 1, tone: "success", text: "North wall sent for review. You can move on." }} />
              </Labeled>
              <Labeled label='tone="locked"'>
                <InFlowToast
                  toast={{
                    id: 2,
                    tone: "locked",
                    text: "Plan locked for execution. Use 'Report Deviation' to alert the remote expert.",
                  }}
                />
              </Labeled>
              <Labeled label='tone="warning"'>
                <InFlowToast
                  toast={{
                    id: 3,
                    tone: "warning",
                    text: "Revoke rejected. The expert opened the North wall report first. It stays escalated.",
                  }}
                />
              </Labeled>
            </div>
          </Specimen>
        </Section>

        {/* ═══════════════════════════ ORGANISMS ═══════════════════════════ */}
        <Section id="organisms" title="Organisms" description="Full panels composed from molecules.">
          <Specimen
            title="RoomDefaultSidebar"
            note="Idle state of the right sidebar (nothing selected): room-level details. With unresolved escalations, their full EscalationCards sit on top and the room properties turn read-only. Header and tabs stay fixed; content scrolls inside a 700px frame."
          >
            <div className="flex flex-wrap gap-6">
              <Labeled label="escalations={[]}">
                <div className="h-[700px] w-fit overflow-hidden rounded-2xl border border-gray-200">
                  <RoomDefaultSidebar onClose={() => record("RoomDefaultSidebar onClose()")} />
                </div>
              </Labeled>
              <Labeled label="escalations={[delivered]}">
                <div className="h-[700px] w-fit overflow-hidden rounded-2xl border border-gray-200">
                  <RoomDefaultSidebar
                    escalations={[
                      {
                        id: "esc-sandbox-room",
                        status: "delivered",
                        issueType: "dimension-mismatch",
                        timestamp: REPORTED,
                        statusChangedAt: REPORTED + 2_000,
                        targetLabel: "North wall",
                        photoUrl: DEMO_PHOTO,
                        dimension: { plannedM: 4.55, measuredM: 4.35 },
                        onPress: () => record("Room card onPress() → select North wall"),
                        onRevoke: () => record("Room card onRevoke()"),
                      },
                    ]}
                    onClose={() => record("RoomDefaultSidebar onClose()")}
                  />
                </div>
              </Labeled>
            </div>
          </Specimen>
        </Section>

        {/* ═══════════════════════════ EVENT LOG ═══════════════════════════ */}
        <section id="log" className="mt-12 scroll-mt-8">
          <h2 className="text-2xl font-bold tracking-tight">Event log</h2>
          <hr className="my-4 border-gray-200" />
          <pre
            aria-live="polite"
            className="min-h-[96px] rounded-xl bg-white p-4 font-mono text-xs text-gray-700 shadow-sm"
          >
            {log.length ? log.join("\n") : "Interact with a specimen to see its callback here."}
          </pre>
        </section>
      </div>
    </div>
  );
}

// ── Specimens ───────────────────────────────────────────────────────────────

const WALL_STATES: { label: string; detail: string; state: DeviationState; selected?: boolean }[] = [
  { label: "idle", detail: 'deviationState="idle"', state: "idle" },
  { label: "isSelected", detail: 'deviationState="idle" selected', state: "idle", selected: true },
  { label: "delivered", detail: 'deviationState="delivered"', state: "delivered" },
  { label: "in_review", detail: 'deviationState="in_review"', state: "in_review" },
  { label: "resolved", detail: 'deviationState="resolved"', state: "resolved" },
];
const ROW_H = 72;
const STRIP_W = 520;

/** All wall variants stacked in one dotted-grid SVG, with HTML labels alongside. */
function CanvasWallStates() {
  return (
    <div className="flex overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <ul className="shrink-0 border-r border-gray-200 bg-gray-50">
        {WALL_STATES.map((w) => (
          <li key={w.label} style={{ height: ROW_H }} className="flex flex-col justify-center px-4">
            <span className="text-sm font-semibold">{w.label}</span>
            <code className="text-[11px] text-gray-500">{w.detail}</code>
          </li>
        ))}
      </ul>
      <svg
        width={STRIP_W}
        height={ROW_H * WALL_STATES.length}
        className="block shrink-0"
        role="img"
        aria-label="CanvasWall states"
      >
        <defs>
          <CanvasWallDefs />
          <pattern id="sandbox-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="11" cy="11" r="1.2" fill="#b9c6d6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sandbox-dots)" />
        {WALL_STATES.map((w, i) => {
          const y = ROW_H * i + ROW_H / 2;
          return (
            <CanvasWall
              key={w.label}
              x1={40}
              y1={y}
              x2={STRIP_W - 40}
              y2={y}
              thickness={WALL_THICKNESS}
              label={`Specimen ${w.label}`}
              deviationState={w.state}
              selected={w.selected}
            />
          );
        })}
      </svg>
    </div>
  );
}

/** Real canvas coordinates, cropped to the top band around the north wall. */
const MINI_H = 300;
const MOCK_ESCALATION: Escalation = {
  id: "esc-sandbox",
  target: NORTH_WALL,
  targetLabel: "North wall",
  issueType: "obstacle",
  photoUrl: DEMO_PHOTO,
  blocking: true,
  createdAt: REPORTED,
  status: "delivered",
  statusChangedAt: REPORTED + 2_000,
};

function MiniCanvas({
  label,
  wallState,
  selected = false,
  children,
}: {
  label: string;
  wallState: DeviationState;
  selected?: boolean;
  children: React.ReactNode;
}) {
  const g = wallGeometry(wallById(NORTH_WALL.id));
  const ext = WALL_THICKNESS / 2;
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="font-mono text-xs text-gray-500">{label}</figcaption>
      <div className="w-fit max-w-full overflow-x-auto rounded-xl border border-gray-200">
        <div
          className="relative bg-mp-canvas bg-[radial-gradient(circle,#b9c6d6_1.2px,transparent_1.4px)] bg-[size:44px_44px]"
          style={{ width: CANVAS_W, height: MINI_H }}
        >
          <svg width={CANVAS_W} height={MINI_H} className="absolute inset-0">
            <defs>
              <CanvasWallDefs />
            </defs>
            <rect x={g.a.x} y={g.a.y} width={g.len} height={MINI_H} fill="#fff" />
            <CanvasWall
              x1={g.a.x - ext}
              y1={g.a.y - ext}
              x2={g.b.x + ext}
              y2={g.b.y - ext}
              label="North wall"
              deviationState={wallState}
              selected={selected}
            />
          </svg>
          {children}
        </div>
      </div>
    </figure>
  );
}

function InFlowToast(props: Partial<Pick<React.ComponentProps<typeof StatusToast>, "toast" | "showHint">>) {
  return (
    <StatusToast
      toast={props.toast ?? null}
      showHint={props.showHint ?? false}
      onDismiss={() => undefined}
      className="relative inset-auto bottom-auto justify-start"
    />
  );
}

function IssueTypePickerDemo({ onChange }: { onChange: (v: IssueType) => void }) {
  const [value, setValue] = useState<IssueType | null>("dimension-mismatch");
  return (
    <div className="rounded-xl bg-mp-panel p-4" style={{ width: PANEL_W }}>
      <IssueTypePicker
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange(v);
        }}
      />
    </div>
  );
}

function NumericStepperDemo() {
  const [value, setValue] = useState(4.35);
  return (
    <div className="rounded-xl bg-mp-panel p-4" style={{ width: PANEL_W }}>
      <NumericStepper label="Measured on site" value={value} onChange={setValue} reference={4.55} />
    </div>
  );
}

function PhotoCaptureDemo({ onChange }: { onChange: (v: PhotoValue | null) => void }) {
  const [value, setValue] = useState<PhotoValue | null>(null);
  return (
    <div style={{ width: CARD_W }}>
      <PhotoCapture
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange(v);
        }}
      />
    </div>
  );
}

// ── Layout primitives (sandbox-only) ────────────────────────────────────────

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-8 first-of-type:mt-0">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <hr className="my-6 border-gray-200" />
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Specimen({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold">{title}</h3>
      {note && <p className="mt-1 text-sm text-gray-500">{note}</p>}
      <div className="mt-5">{children}</div>
    </article>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-xs text-gray-500">{label}</span>
      {children}
    </div>
  );
}

/** Sidebar-coloured backdrop at sidebar width, so cards are judged in context. */
function SidebarBackdrop({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Labeled label={label}>
      <div className="rounded-2xl bg-mp-panel p-5" style={{ width: CARD_W + 40 }}>
        {children}
      </div>
    </Labeled>
  );
}

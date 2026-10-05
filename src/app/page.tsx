"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MeasurementPopover } from "@/components/molecules/MeasurementPopover";
import type { ObjectProposal } from "@/components/organisms/PlanObjects";
import { CanvasArea } from "@/components/organisms/CanvasArea";
import { DeviceStatusBar } from "@/components/organisms/DeviceStatusBar";
import { DevToolsPanel, useDevToolsToggle } from "@/components/organisms/DevToolsPanel";
import { IPadFrame } from "@/components/organisms/IPadFrame";
import { LOCKED_MESSAGE, LeftToolbar } from "@/components/organisms/LeftToolbar";
import { RightSidebar } from "@/components/organisms/RightSidebar";
import { StatusToast } from "@/components/organisms/StatusToast";
import { TopBar } from "@/components/organisms/TopBar";
import { PROJECT, dimensionLabelAt, elementInfo, objectById, toPx, wallById, wallSpotText } from "@/lib/floorplan";
import { CANVAS_H, CANVAS_W } from "@/lib/layout";
import { PANEL_W } from "@/lib/layout";
import type { EscalationStatus, ObjectDims, Point, SelectedElement } from "@/lib/types";
import type { TabRequest } from "@/lib/useTabRequest";
import { WALL_CATEGORY, useDeviationState } from "@/store/useDeviationState";
import { DiscardDraftDialog } from "@/components/molecules/DiscardDraftDialog";

/**
 * Main iPad layout shell (landscape). Owns the store and composes organisms:
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ DeviceStatusBar                                              │
 *   │ TopBar: breadcrumbs · 🔒 Locked (Permit Approved) · expert   │
 *   ├───────────────────────────────────────────┬──────────────────┤
 *   │ LeftToolbar ┐  Insert → ghost wall;       │                  │
 *   │ (overlay)   │  tap 4.55 → correction     │   RightSidebar   │
 *   │             ┘      (dot grid + plan)      │   (350px)        │
 *   │              StatusToast                  │                  │
 *   └───────────────────────────────────────────┴──────────────────┘
 *
 * The toolbar and toast share the canvas grid cell (stacked with
 * grid-area), so they float over the plan like magicplan's palette instead of
 * shrinking it.
 */
/** Insert → Note / Photo / Form alerts: allowed (no geometry change), tab opened. */
const INSERT_OTHER_ALERT: Record<"note" | "photo" | "form", string> = {
  note: "Plan locked, but notes are allowed: Photos & Notes is open. Type your note.",
  photo: "Plan locked, but photos are allowed: Photos & Notes is open. Tap + to add one.",
  form: "Plan locked, but forms are allowed: the Forms tab is open.",
};

/** The Change Measurement popover's target: a wall's length or an object attribute. */
type MeasureTarget =
  | { kind: "wall"; wallId: string; at: Point }
  | { kind: "object"; id: string; field: keyof ObjectDims; at: Point };

const OBJECT_FIELD_LABEL: Record<keyof ObjectDims, string> = {
  widthM: "Width",
  depthM: "Depth",
  heightM: "Height",
  rotation: "Rotation",
};

export default function Page() {
  const store = useDeviationState();
  const dev = useDevToolsToggle();
  const { selectedElement, draft, selectedEscalation } = store;

  const selectedPending = selectedElement ? store.pendingRevokeFor(selectedElement) : undefined;

  // Stable callbacks so the memoised CanvasArea skips re-rendering the SVG plan
  // when only unrelated state (toast, sidebar, toolbar) changes.
  const { escalationFor, selectElement, clearSelection } = store;
  const statusFor = useCallback(
    (el: SelectedElement) => escalationFor(el)?.status,
    [escalationFor],
  );
  // Ghost walls of submitted Undocumented Element reports stay on the plan.
  // Submitted proposals stay on the plan: a drawn wall as its line, objects as squares.
  const markers = useMemo(
    () =>
      store.escalations.flatMap((e) =>
        e.marker
          ? [
              {
                id: e.id,
                point: e.marker,
                status: e.status,
                spot: e.markerSpot,
                line: e.line,
                items: e.items,
                category: e.category,
              },
            ]
          : [],
      ),
    [store.escalations],
  );
  const draftGhost = useMemo(
    () =>
      draft?.marker
        ? {
            point: draft.marker,
            spot: draft.spot,
            line: draft.line,
            items: draft.items,
            activeItem: draft.activeItem,
            category: draft.category,
          }
        : null,
    [draft?.marker, draft?.spot, draft?.category, draft?.line, draft?.items, draft?.activeItem],
  );
  // The blue triangle: on the selected wall's tapped spot, or the spot the
  // open ghost is tied to (it goes once the ghost is moved off it).
  const tapSpot = draft
    ? (draft.spot ?? null)
    : selectedElement?.type === "wall" && store.wallSpot?.wallId === selectedElement.id
      ? store.wallSpot
      : null;
  const onSelect = useCallback(
    (el: SelectedElement | null) => (el ? selectElement(el.id) : clearSelection()),
    [selectElement, clearSelection],
  );

  // ── Intercept and Propose ───────────────────────────────────────────────
  // 1. Wall length (canvas label or inspector) → Change Measurement popover
  //    → Propose Correction → Dimension Mismatch, value prefilled
  // 2. Insert → Object → any category → ghost_draft → tap the plan
  //    → Undocumented Element → <category>
  // 3. Object → popover (width / depth / height / rotation) or rotate handle
  //    → Object change, drawn as a red dashed ghost over the original
  const placing = store.interactionMode === "ghost_draft";
  // Drawing (or reporting) a wall. Started from Add Wall at the blue
  // triangle, Add Wall shows pressed instead of Insert.
  const wallFlow = store.ghostCategory === WALL_CATEGORY || draft?.category === WALL_CATEGORY;
  const [viaAddWall, setViaAddWall] = useState(false);
  const addingWall = wallFlow && viaAddWall;
  const inserting = (placing || draft?.intent === "missing-element") && !addingWall;
  const { startDraft, startGhostDraft, cancelDraft, notify, proposeObjectChange, updateDraft, requestDiscard } =
    store;
  // Insert → Note / Photo / Form: these never change the plan, so they're
  // allowed. Open the matching sidebar tab and say so.
  const [tabRequest, setTabRequest] = useState<TabRequest | null>(null);
  const clearTabRequest = useCallback(() => setTabRequest(null), []);
  const openTabFor = (kind: "note" | "photo" | "form") => {
    setTabRequest(kind === "form" ? { tab: "Forms" } : { tab: "Photos & Notes", focusNote: kind === "note" });
    notify(INSERT_OTHER_ALERT[kind], "hint");
  };
  // A draft open: ask before discarding it (only ✕ / Send close it silently).
  const onInsertOther = (kind: "note" | "photo" | "form") =>
    draft ? requestDiscard(() => openTabFor(kind)) : openTabFor(kind);
  // One popover for every locked value; Propose Correction writes into the draft.
  const [measure, setMeasure] = useState<MeasureTarget | null>(null);
  const closeMeasure = useCallback(() => setMeasure(null), []);
  // While a draft is open, only its own element's values open directly; another
  // element's popover asks to discard the draft first.
  const draftAnchorId = draft?.anchor.id;
  const openMeasure = useCallback(
    (m: MeasureTarget) => {
      const id = m.kind === "wall" ? m.wallId : m.id;
      if (draftAnchorId && draftAnchorId !== id) return requestDiscard(() => setMeasure(m));
      setMeasure(m);
    },
    [draftAnchorId, requestDiscard],
  );
  const onDimensionTap = useCallback(
    (wallId: string, at: Point) => openMeasure({ kind: "wall", wallId, at }),
    [openMeasure],
  );
  const onMeasureWall = useCallback(
    (wallId: string) => openMeasure({ kind: "wall", wallId, at: dimensionLabelAt(wallById(wallId)) }),
    [openMeasure],
  );
  const onMeasureObject = useCallback(
    (id: string, field: keyof ObjectDims) =>
      openMeasure({ kind: "object", id, field, at: toPx(objectById(id).center) }),
    [openMeasure],
  );
  // 3b. Drag an object → its proposed position (shown visually, no numbers).
  const onMoveObject = useCallback(
    (id: string, center: Point) => proposeObjectChange(id, { center }),
    [proposeObjectChange],
  );
  const onRotateObject = useCallback(
    (id: string, rotation: number) => proposeObjectChange(id, { rotation }),
    [proposeObjectChange],
  );

  const measureProps = (() => {
    if (!measure) return null;
    if (measure.kind === "wall") {
      const plan = wallById(measure.wallId).lengthM;
      const same = draft?.intent === "wall-length" && draft.anchor.id === measure.wallId;
      return {
        label: "Length",
        planValue: plan,
        value: (same && draft?.measuredM) || plan,
        unit: "m" as const,
        apply: (v: number) =>
          same ? updateDraft({ measuredM: v }) : startDraft({ type: "wall", id: measure.wallId }, "wall-length", v),
      };
    }
    const o = objectById(measure.id);
    const same = draft?.intent === "object-change" && draft.anchor.id === measure.id;
    return {
      label: OBJECT_FIELD_LABEL[measure.field],
      planValue: o[measure.field],
      value: same ? draft!.proposed![measure.field] : o[measure.field],
      unit: measure.field === "rotation" ? ("°" as const) : ("m" as const),
      apply: (v: number) => proposeObjectChange(measure.id, { [measure.field]: v }),
    };
  })();

  // Elements proposed for removal (Delete…): the open draft wins over sent reports.
  const removals = useMemo(() => {
    const out: Record<string, EscalationStatus | "draft"> = {};
    for (const e of [...store.escalations].reverse()) {
      if (e.issueType === "element-not-on-site") out[`${e.target.type}:${e.target.id}`] = e.status;
    }
    if (draft?.intent === "remove") out[`${draft.anchor.type}:${draft.anchor.id}`] = "draft";
    return out;
  }, [store.escalations, draft]);

  // Proposals drawn over objects: the open draft (red) wins over a sent report.
  const objectProposals = useMemo(() => {
    const out: Record<string, ObjectProposal> = {};
    for (const e of [...store.escalations].reverse()) {
      if (e.objectChange && e.target.type === "object") out[e.target.id] = { dims: e.objectChange.to, status: e.status };
    }
    if (draft?.intent === "object-change" && draft.proposed) out[draft.anchor.id] = { dims: draft.proposed, status: "draft" };
    return out;
  }, [store.escalations, draft]);


  // ⌘Z / ⇧⌘Z (Ctrl on other keyboards) step through the draft, except in a text field.
  const { undo, redo } = store;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      e.preventDefault();
      (e.shiftKey ? redo : undo)();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const breadcrumbs = [
    PROJECT.floor,
    PROJECT.room,
    ...(selectedElement
      ? [
          // The inserted element is selected: name it, like magicplan's "Wall".
          selectedElement.type === "ghost"
            ? draft?.category === WALL_CATEGORY
              ? "New wall (proposed)"
              : `${draft?.category ?? "Element"} (proposed)`
            : elementInfo(selectedElement).label,
        ]
      : []),
  ];

  // Dev tools act on the selected element's report, else the newest one.
  const devTarget =
    selectedPending ??
    (selectedEscalation ? { escalation: selectedEscalation, settlesAt: undefined } : undefined) ??
    [
      ...Object.values(store.pendingRevokes),
      ...store.escalations.map((e) => ({ escalation: e, settlesAt: undefined })),
    ].sort((a, b) => b.escalation.createdAt - a.escalation.createdAt)[0];

  return (
    <IPadFrame>
      <div className="grid h-full grid-rows-[auto_auto_minmax(0,1fr)]">
        <DeviceStatusBar onSecretTap={dev.toggle} />
        <TopBar breadcrumbs={breadcrumbs} />

        <div
          className="grid min-h-0"
          style={{ gridTemplateColumns: `minmax(0,1fr) ${PANEL_W}px` }}
        >
          {/* Canvas column: plan, toolbar, toast and dev tools stacked in one cell */}
          <div className="relative grid min-h-0 [grid-template-areas:'stack']">
            <CanvasArea
              className="[grid-area:stack]"
              selectedElement={selectedElement}
              statusFor={statusFor}
              photoCountFor={store.standardPhotoCount}
              onSelect={onSelect}
              onSelectWallAt={store.selectWallAt}
              tapSpot={tapSpot}
              placing={placing}
              draftMarker={draft?.marker ?? null}
              draftGhost={draftGhost}
              ghostSelected={selectedElement?.type === "ghost"}
              wallStart={store.wallStart}
              onSelectItem={store.selectItem}
              onMoveItem={store.moveItem}
              onRotateItem={store.rotateItem}
              onPlace={store.placeGhost}
              onCancelPlacing={cancelDraft}
              ghostCategory={store.ghostCategory}
              markers={markers}
              undo={{ canUndo: store.canUndo, canRedo: store.canRedo, onUndo: store.undo, onRedo: store.redo }}
              onDimensionTap={onDimensionTap}
              objectProposals={objectProposals}
              onRotateObject={onRotateObject}
              onMoveObject={onMoveObject}
              removals={removals}
            />

            <LeftToolbar
              // Room view (nothing or the floor selected) → room-level actions;
              // a wall or corner selected → element drafting tools. All locked
              // except Insert, which starts ghost drafting.
              mode={
                !selectedElement || selectedElement.type === "room"
                  ? "room"
                  : selectedElement.type === "object" || (selectedElement.type === "ghost" && !!draft?.items)
                    ? "object"
                    : "element"
              }
              className="z-10 ml-4 self-center justify-self-start [grid-area:stack]"
              inserting={inserting}
              draftOpen={!!draft}
              canDelete={
                !!selectedElement && ["wall", "corner", "object", "ghost"].includes(selectedElement.type)
              }
              // Inserted objects: Duplicate adds a copy; Delete removes the selected one.
              canDuplicate={selectedElement?.type === "ghost" && !!draft?.items}
              onDuplicate={store.duplicateItem}
              deleting={draft?.intent === "remove"}
              onDelete={() =>
                selectedElement?.type === "ghost"
                  ? store.deleteItem()
                  : selectedElement && startDraft(selectedElement, "remove")
              }
              onInsertCategory={(c) => {
                setViaAddWall(false);
                startGhostDraft(c);
              }}
              // Insert again stops placing; an open draft stays (only ✕ / Send close it).
              onCancelInsert={() => (draft ? requestDiscard() : cancelDraft())}
              onInsertOther={onInsertOther}
              onLockedTool={() => notify(LOCKED_MESSAGE, "locked")}
              canAddWall={!!store.wallSpot && selectedElement?.type === "wall" && !draft}
              addingWall={addingWall}
              onAddWall={() => {
                if (draft) return requestDiscard();
                if (placing) return cancelDraft();
                setViaAddWall(true);
                startGhostDraft(WALL_CATEGORY);
              }}
              spotLabel={
                store.wallSpot && !draft
                  ? `${wallById(store.wallSpot.wallId).label}, ${wallSpotText(store.wallSpot)}`
                  : null
              }
            />

            <AnimatePresence>
              {measure && measureProps && (
                <MeasurementPopover
                  key={`${measure.kind}-${measure.kind === "wall" ? measure.wallId : `${measure.id}-${measure.field}`}`}
                  at={measure.at}
                  label={measureProps.label}
                  value={measureProps.value}
                  planValue={measureProps.planValue}
                  unit={measureProps.unit}
                  canvasWidth={CANVAS_W}
                  canvasHeight={CANVAS_H}
                  onClose={closeMeasure}
                  onApply={(v) => {
                    setMeasure(null);
                    measureProps.apply(v);
                  }}
                />
              )}
            </AnimatePresence>

            <StatusToast
              toast={store.toast}
              // Hidden while placing: the canvas banner says what to tap.
              showHint={!selectedElement && !dev.open && !placing}
              raised={dev.open}
              onDismiss={store.dismissToast}
            />

            <DevToolsPanel
              open={dev.open}
              onClose={() => dev.setOpen(false)}
              target={devTarget?.escalation}
              revokeSettlesAt={devTarget?.settlesAt}
              demo={store.demo}
              setDemo={store.setDemo}
              setStatus={store.devSetStatus}
              onMockReview={store.mockExpertReview}
              reset={store.reset}
            />
          </div>

          {/* Swaps: room panel / Active Escalations ↔ inspector ↔ EscalationDraftPane */}
          <RightSidebar
            selected={selectedElement}
            selectedEscalation={selectedEscalation}
            pendingRevoke={selectedPending?.escalation}
            draft={draft}
            escalations={store.escalations}
            onCancelDraft={cancelDraft}
            onDraftChange={updateDraft}
            onMeasureWall={onMeasureWall}
            onMeasureObject={onMeasureObject}
            tabRequest={tabRequest}
            onTabRequestHandled={clearTabRequest}
            onSubmit={store.submitEscalation}
            onFocus={(el) => store.selectElement(el.id)}
            onClear={store.clearSelection}
            onRevoke={(id) => store.revokeEscalation(id)}
            onAdvance={store.advanceEscalation}
            mediaFor={store.mediaFor}
            onMediaChange={store.setMediaFor}
          />
        </div>
      </div>
      {/* Stray tap while drafting → confirm before throwing the draft away. */}
      <DiscardDraftDialog
        open={store.discardPrompt}
        onKeep={store.keepDraftOpen}
        onDiscard={store.confirmDiscard}
      />
    </IPadFrame>
  );
}

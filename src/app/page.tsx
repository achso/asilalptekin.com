"use client";

import { useCallback, useMemo } from "react";
import { CanvasArea } from "@/components/organisms/CanvasArea";
import { DeviceStatusBar } from "@/components/organisms/DeviceStatusBar";
import { DevToolsPanel, useDevToolsToggle } from "@/components/organisms/DevToolsPanel";
import { IPadFrame } from "@/components/organisms/IPadFrame";
import { LOCKED_MESSAGE, LeftToolbar } from "@/components/organisms/LeftToolbar";
import { RightSidebar } from "@/components/organisms/RightSidebar";
import { StatusToast } from "@/components/organisms/StatusToast";
import { TopBar } from "@/components/organisms/TopBar";
import { PROJECT, ROOM, elementInfo } from "@/lib/floorplan";
import { PANEL_W } from "@/lib/layout";
import type { DimensionField, SelectedElement } from "@/lib/types";
import { useDeviationState } from "@/store/useDeviationState";

/**
 * Main iPad layout shell (landscape). Owns the store and composes organisms:
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ DeviceStatusBar                                              │
 *   │ TopBar: breadcrumbs · 🔒 Locked (Permit Approved) · expert   │
 *   ├───────────────────────────────────────────┬──────────────────┤
 *   │ LeftToolbar ┐  Insert / Add Wall / Set    │                  │
 *   │ (overlay)   │  Size / Delete → proposals  │   RightSidebar   │
 *   │             ┘      (dot grid + plan)      │   (350px)        │
 *   │              StatusToast                  │                  │
 *   └───────────────────────────────────────────┴──────────────────┘
 *
 * The toolbar and toast share the canvas grid cell (stacked with
 * grid-area), so they float over the plan like magicplan's palette instead of
 * shrinking it.
 */
export default function Page() {
  const store = useDeviationState();
  const dev = useDevToolsToggle();
  const { selectedElement, draft, selectedEscalation } = store;
  const roomEl: SelectedElement = { type: "room", id: ROOM.id };

  const selectedPending = selectedElement ? store.pendingRevokeFor(selectedElement) : undefined;

  // Stable callbacks so the memoised CanvasArea skips re-rendering the SVG plan
  // when only unrelated state (toast, sidebar, toolbar) changes.
  const { escalationFor, selectElement, clearSelection } = store;
  const statusFor = useCallback(
    (el: SelectedElement) => escalationFor(el)?.status,
    [escalationFor],
  );
  // Ghost Markers of submitted Undocumented Element reports stay on the plan.
  const markers = useMemo(
    () =>
      store.escalations.flatMap((e) =>
        e.marker ? [{ id: e.id, point: e.marker, status: e.status, category: e.category }] : [],
      ),
    [store.escalations],
  );
  const onSelect = useCallback(
    (el: SelectedElement | null) => (el ? selectElement(el.id) : clearSelection()),
    [selectElement, clearSelection],
  );

  // ── Intercept and Propose ───────────────────────────────────────────────
  // The locked toolbar's tools never edit; each opens a proposal draft.
  const placing = store.interactionMode === "ghost_draft";
  const activeTool = store.pendingGhost?.via ?? draft?.intent.via ?? null;
  const { startDraft, startGhostDraft, cancelDraft, notify } = store;
  const onProposeDimension = useCallback(
    (anchor: SelectedElement, field: DimensionField) =>
      startDraft(anchor, { kind: "dimension", field, via: "sidebar" }),
    [startDraft],
  );
  const toolbar = {
    onInsert: (c: Parameters<typeof startGhostDraft>[0]) => startGhostDraft(c, "insert"),
    // Tapping the pressed Add Wall again leaves ghost drafting.
    onAddWall: () => (activeTool === "add-wall" ? cancelDraft() : startGhostDraft("structural", "add-wall")),
    onSetSize: () => startDraft(roomEl, { kind: "dimension", field: "room-size", via: "set-size" }),
    onDelete: () =>
      selectedElement && (selectedElement.type === "wall" || selectedElement.type === "corner")
        ? startDraft(selectedElement, { kind: "delete", via: "delete" })
        : notify("Select the wall or corner that isn't on site, then tap Delete.", "hint"),
  };

  const breadcrumbs = [
    PROJECT.floor,
    PROJECT.room,
    ...(selectedElement ? [elementInfo(selectedElement).label] : []),
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
              placing={placing}
              draftMarker={draft?.marker ?? null}
              draftCategory={
                (draft?.intent.kind === "insert" ? draft.intent.category : store.pendingGhost?.category) ?? null
              }
              onPlace={store.placeGhost}
              onCancelPlacing={cancelDraft}
              markers={markers}
            />

            <LeftToolbar
              // Room view (nothing or the floor selected) → room-level actions;
              // a wall or corner selected → element drafting tools. Locked, but
              // Insert / Add Wall / Set Size / Delete are intercepted into proposals.
              mode={selectedElement && selectedElement.type !== "room" ? "element" : "room"}
              className="z-10 ml-4 self-center justify-self-start [grid-area:stack]"
              activeTool={activeTool}
              {...toolbar}
              onLockedTool={() => notify(LOCKED_MESSAGE, "locked")}
            />

            <StatusToast
              toast={store.toast}
              showHint={!selectedElement && !dev.open}
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
            onProposeDimension={onProposeDimension}
            onCancelDraft={cancelDraft}
            onSubmit={store.submitEscalation}
            onFocus={(el) => store.selectElement(el.id)}
            onClear={store.clearSelection}
            onRevoke={(id) => store.revokeEscalation(id)}
            mediaFor={store.mediaFor}
            onMediaChange={store.setMediaFor}
          />
        </div>
      </div>
    </IPadFrame>
  );
}

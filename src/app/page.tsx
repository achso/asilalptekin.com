"use client";

import { useCallback, useMemo, useState } from "react";
import { CanvasArea } from "@/components/organisms/CanvasArea";
import { DeviceStatusBar } from "@/components/organisms/DeviceStatusBar";
import { DevToolsPanel, useDevToolsToggle } from "@/components/organisms/DevToolsPanel";
import { IPadFrame } from "@/components/organisms/IPadFrame";
import { LOCKED_MESSAGE, LeftToolbar } from "@/components/organisms/LeftToolbar";
import { RightSidebar } from "@/components/organisms/RightSidebar";
import { StatusToast } from "@/components/organisms/StatusToast";
import { TopBar } from "@/components/organisms/TopBar";
import { PROJECT, elementInfo } from "@/lib/floorplan";
import { PANEL_W } from "@/lib/layout";
import type { SelectedElement } from "@/lib/types";
import type { TabRequest } from "@/lib/useTabRequest";
import { useDeviationState } from "@/store/useDeviationState";

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
  const markers = useMemo(
    () =>
      store.escalations.flatMap((e) =>
        e.marker ? [{ id: e.id, point: e.marker, status: e.status }] : [],
      ),
    [store.escalations],
  );
  const onSelect = useCallback(
    (el: SelectedElement | null) => (el ? selectElement(el.id) : clearSelection()),
    [selectElement, clearSelection],
  );

  // ── Intercept and Propose: two hardcoded paths ──────────────────────────
  // 1. 4.55 popover → Propose Correction → Dimension Mismatch (North wall)
  // 2. Insert → Object → any category → ghost_draft → tap the plan
  //    → Undocumented Element → <category>
  const placing = store.interactionMode === "ghost_draft";
  const inserting = placing || draft?.intent === "missing-element";
  const { startDraft, startGhostDraft, cancelDraft, notify } = store;
  // Insert → Note / Photo / Form: these never change the plan, so they're
  // allowed. Open the matching sidebar tab and say so.
  const [tabRequest, setTabRequest] = useState<TabRequest | null>(null);
  const clearTabRequest = useCallback(() => setTabRequest(null), []);
  const onInsertOther = (kind: "note" | "photo" | "form") => {
    if (draft) cancelDraft(); // the panel is needed for the tab
    setTabRequest(kind === "form" ? { tab: "Forms" } : { tab: "Photos & Notes", focusNote: kind === "note" });
    notify(INSERT_OTHER_ALERT[kind], "hint");
  };
  const onProposeWallLength = useCallback(
    (wallId: string) => startDraft({ type: "wall", id: wallId }, "wall-length"),
    [startDraft],
  );


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
              onPlace={store.placeGhost}
              onCancelPlacing={cancelDraft}
              ghostCategory={store.ghostCategory}
              markers={markers}
              onProposeWallLength={onProposeWallLength}
            />

            <LeftToolbar
              // Room view (nothing or the floor selected) → room-level actions;
              // a wall or corner selected → element drafting tools. All locked
              // except Insert, which starts ghost drafting.
              mode={selectedElement && selectedElement.type !== "room" ? "element" : "room"}
              className="z-10 ml-4 self-center justify-self-start [grid-area:stack]"
              inserting={inserting}
              onInsertCategory={startGhostDraft}
              onCancelInsert={cancelDraft}
              onInsertOther={onInsertOther}
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
            onCancelDraft={cancelDraft}
            tabRequest={tabRequest}
            onTabRequestHandled={clearTabRequest}
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

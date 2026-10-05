# magicplan · Field Escalation (iPad prototype)

A browser-based iPad app (landscape) that lets a contractor on site flag a
space problem **directly on the floor plan** and send it to the remote expert
in Munich: one-way, fire-and-forget, so they never wait on a reply. The plan
is locked, so ordinary CAD actions (editing a dimension, inserting a wall)
are intercepted and turned into proposals.

> Take-home for the magicplan Product Designer challenge.
> Built with Next.js 15, React 19, Tailwind CSS v4 and Framer Motion.

---

## Run it locally

**Requirements:** Node.js 18.18 or newer (20 LTS recommended) and npm.

```bash
# 1. Clone only this prototype branch
git clone --branch claude/pensive-gauss-tldayl --single-branch \
  https://github.com/achso/asilalptekin.com.git magicplan-escalation
cd magicplan-escalation

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open **http://localhost:3000**.

For a production build:

```bash
npm run build && npm start
```

### Viewing on a real iPad

```bash
npm run dev:lan        # binds to 0.0.0.0
```

Open `http://<your-computer's-LAN-IP>:3000` in Safari on an iPad on the same
Wi-Fi and hold it in landscape. For a full-screen, app-like view, tap
**Share → Add to Home Screen**.

On a desktop browser the app renders inside an iPad frame (1180 × 820,
iPad Air / Pro 11" landscape) and scales to fit the window.

> **Note:** browsers only allow microphone access on `https` or `localhost`.
> Over a plain-http LAN address the voice memo falls back to a simulated
> recording. The flow still works the same way.

---

## Demo script (≈ 60 seconds): Intercept and Propose

The permit is approved, so the plan is in its **execution state**: the header
shows **🔒 Locked (Permit Approved)**, the geometry is read-only and the
plan's dimensions carry a small lock. There is no separate "Report Deviation"
button. The contractor does what they'd do in magicplan anyway, the locked
plan **intercepts** it, and an **Escalation Draft** slides into the right
sidebar with the intent already filled in.

> This is a *Wizard of Oz* prototype: four interaction paths are wired up
> end to end, to demonstrate the UX concept. Every other tool stays locked
> and explains why when tapped.

### Path 1: "The measurement is off"

1. Tap any wall dimension on the plan (e.g. **4.55** above the North wall;
   they're tinted blue and carry the native lock glyph), or a wall's
   **Length** value in the inspector.
2. magicplan's **Change Measurement** popover opens: **Reset** (back to the
   plan value), the value field and a dark **🔒 Propose Correction** button.
   Type the laser reading and propose it.
3. The draft opens with that reading prefilled: *Proposing · Dimension
   Mismatch · East wall · plan 3.30 m*. Opening the popover again on the same
   wall shows (and updates) the proposed value. The line under the input
   shows the difference ("−20 cm vs plan").

### Path 2: "There's something on site that isn't on the plan"

1. Tap **+ Insert** in the left toolbar. magicplan's Insert popover opens:
   **Room** (locked), **Object**, **Note**, **Photo**, **Form**. Note, Photo
   and Form never change the plan, so they're allowed: the sidebar jumps to
   the matching tab (Photos & Notes, with the cursor in the note field for
   Note; Forms for Form) and an alert says why. This works for the room panel
   and for a selected element's inspector, and closes an open draft.
2. Tap **Object**: the popover turns into the **All Objects** grid
   (Structural, Doors, Windows, Plumbing, Appliances, Electrical, HVAC,
   Furniture), with ‹ back and ✕.
3. Tap **any** category. They all lead through the same trapdoor: the menu
   closes and a red banner on the canvas says *Tap where the missing element
   is* with the category as a chip (✕ or Insert again cancels).
4. Tap inside the room: a **red dashed ghost** (100 × 10 px, faint red fill,
   never solid black) appears centred on the tap, and the draft opens:
   *Proposing · Undocumented Element → Plumbing* (whatever was picked). Tap
   the plan again to move it; the pane shows its distance from the west and
   north walls.
5. Enter its **Measured Length** (*Length of physical wall* for Structural,
   *Length of element* otherwise).

**Tied to a spot on a wall (native).** Tap a wall first: as in magicplan, the
exact spot gets a **blue triangle** on the wall's inner face with a white notch
through the wall, and the toolbar switches to the element tools (Insert, Add
Corner, Add Wall, Split Room, Delete…). Tapping the wall again moves the spot.
Insert → Object now says *Inserts at the marked spot: North wall, 1.80 m from
the west end*, and picking a category skips step 4: the ghost lands on the spot
and the draft opens at once, with *At the marked spot · North wall* in place
of the coordinates.

- **Structural** is drawn the way magicplan inserts a wall: a new wall running
  **perpendicular** from the spot into the room, 1.50 m until measured, then
  as long as the Measured Length typed (live). The host wall's dimension is
  split at the spot (e.g. 4.14 | 0.41) and the length is labelled.
- **Any other category** sits against the wall, parallel to it.
- It stays **attached to that wall**. Drag it (magicplan's ring handle with
  two arrows shows on the selected element) and it slides left / right along
  the host wall only; the triangle, split dimensions and the pane's
  *"2.86 m from the west end"* follow. One drag = one ⌘Z step. Tapping it does
  nothing; a tap elsewhere asks to discard the draft, like every other draft.
- **Add Wall** is live while a spot is marked: it's the shortcut for
  Insert → Object → Structural at the spot (pressed while that draft is open;
  tapping it again asks to discard, like Insert).
- As in magicplan, **the inserted element becomes the selection**: blue
  selection under the red proposal dash, the host wall goes back to black, and
  the title reads *New wall (proposed)* (or *Plumbing (proposed)*, …). ✕ on
  the draft gives the selection back to the host wall, triangle included.

### Path 3: "This object is a different size, or turned"

1. Tap the **kitchen counter**, the **table** or the **chair**. It gets
   magicplan's blue selection frame and the curved **rotate arrow**; the
   inspector shows **Width / Depth / Height / Rotation** as native value pills.
2. Change a value: tap its pill → the same Change Measurement popover →
   Propose Correction. Or **rotate**: drag the arrow. Rotation is free and
   snaps magnetically to every 45°; on a snapped angle the arrow turns
   **green** (blue otherwise), and a dashed circle shows the rotation path.
   A plain tap on the arrow turns it to the next 45°. Or **move** it: drag the
   object itself. Position is shown visually only (no coordinates): the faded
   original stays where the plan has it, the proposal follows your finger, and
   a dashed arrow links the two. The draft's *Position* row says "Moved on
   plan" with a Reset; the card adds "Moved".
3. The plan stays locked: the original stays drawn (faded) and the proposal
   is drawn over it as a **red dashed ghost**. The draft (*Dimension
   Mismatch · Small table (rectangular)*) lists all four values against the
   plan; editing them there, in the popover or with the arrow all change the
   same proposal, live on the canvas. Send needs at least one change and a
   photo; the card reads e.g. "W 0.95 → 1.10 m · ↻ 0° → 45°", and the
   ghost stays on the plan in its status colour.

### Path 4: "This isn't on site at all"

Select a wall, a corner or an object: **Delete…** in the left toolbar comes
alive (it stays locked in the room view). Tapping it deletes nothing: it opens
*Proposing · Element Not on Site · Small table (rectangular)*. The element is
crossed out on the plan (red dashed outline and cross for an object, a red
dashed overlay on a wall, a ring on a corner) and only a photo is needed. Once
sent, the cross-out stays in the report's status colour until the expert
reviews it.

### All paths

- **Evidence (at least one photo) is mandatory**: the + tile opens the iPad's
  rear camera; on a laptop use *"No camera? Use demo photo"*. Voice memo is
  optional; *Work is blocked here* is on by default.
- **Send to review** stays disabled until there's a reading above 0 (or, for
  an object, at least one change) and a photo, and its label names what's
  missing ("Add length + photo"). Budget
  (€40k), permit status and a plan snapshot are attached automatically and
  shown above it.
- After sending, the pane closes **right away**. The North wall locks in a
  **red hatched pattern** with a status pin; the ghost stays on the plan in
  its status colour. Both appear in **Active Escalations** on the room
  panel, and the contractor moves on.
- A draft closes **only** with its round **✕** (or by sending it). A tap
  elsewhere (canvas, another element, a pin, another dimension, Insert)
  shows a **"Discard this escalation draft?"** alert: *Keep Editing* (also
  Esc or a tap on the backdrop) or *Discard Draft*, which then carries out
  what you tapped. The draft's own element stays editable.
- **Undo / redo** (top right, or ⌘Z / ⇧⌘Z) step through the open draft:
  moves, rotations, value changes and ghost placement. A whole drag or
  rotation is one step; the first undo returns to "no changes" without
  closing the draft. With no draft open there's nothing to undo on the
  locked plan, so they show disabled.

**Canvas badges:** an element with standard Photos & Notes shows magicplan's
yellow paperclip. If it's also escalated, only the escalation pin shows (red,
amber or green): the blocker always wins.

The top bar shows how long the remote expert is still available (live
countdown to 15:00 Europe/Berlin).

---

## Presenter controls: deviation lifecycle and the revoke race

**Simulated backend.** Every report starts **queued** (saved on the iPad) and
moves on by itself: **sending** after 1 s (or as soon as the iPad is back
online), **delivered** 1.5 s later, then **in review** 3 s later if the remote
expert is online (before 15:00 CET). **Cheat for reviewers:** double-tap a
card's header to force the next state (queued → sending → delivered → in
review → resolved) without waiting. Resolved reports leave *Active
Escalations*; select the element to see its resolved card.

**Report Deviation pane.** The intercepted action preselects the issue type;
*Change type* lists all four with their one-line definitions (Dimension
Mismatch, Undocumented Element, Element Not on Site, Site Condition Hazard).
Picking another type keeps the photo and note but drops the intercept's
values. Under the send button: *Auto-attached to ticket: plan snapshot,
dimensions, budget ≈ €40,000, permit approved last Tuesday, site history,
expert availability.*

Each report moves through an explicit state machine (`lib/deviationMachine.ts`):

```
idle ─submit─▶ queued ─▶ sending ─▶ delivered ─▶ in_review ─▶ resolved
 ▲                 │           │             ✕
 └──── revoke ─────┴───────────┘      revoke rejected
   (optimistic; confirmed by the server after network latency)
```

| State | Canvas | Escalation card |
|---|---|---|
| Queued (offline-first) | Hatched wall, gray cloud-off pin | Gray **Saved** pill, "Reported 14:46 · Offline"; sends by itself when a connection returns; Revoke available |
| Idle (locked plan) | Black wall, toolbar tools disabled | — |
| Delivered | Red hatched wall, red lock pin | **Revoke Escalation** available |
| In Review | Hatched wall framed in amber with a pulse, amber eye pin | Revoke hidden; yellow "Expert is reviewing" badge and the note *"The expert is actively reviewing. Revocation disabled."* |
| Resolved | Green wall, green check pin | Contractor unblocked; the wall can be reported again |

**Open the hidden Dev Tools:** press **Shift + D**, **triple-tap the clock** in
the status bar (works on the iPad), or load **`/?dev=1`**. The panel flips the
expert-side status between **Delivered / In Review / Resolved**, and has:

- **Auto-advance:** the expert opens the report after ~7s and resolves it after ~14s.
- **Slow revoke (3s):** on by default, so there's time to show the race.
- **Reset** clears the demo.

**Demonstrating the race condition:**

1. Send a proposal (e.g. Path 1) and wait for **Delivered**.
2. Tap **Revoke Escalation**. The wall unlocks right away (optimistic update),
   and the panel counts down while the revoke is "in flight".
3. Before the countdown ends, tap **In Review** in Dev Tools.
4. The server wins. The revoke is rejected, the escalation comes back as
   **In Review**, and the Revoke button stays hidden.

The rule is enforced in the reducer, not only in the UI. A stale tap or
double-tap on Revoke after the report reaches In Review is rejected with the
same message.

---

## Component sandbox

Open **http://localhost:3000/sandbox** (or `:3001` if you run on that port):
a long-scrolling "kitchen sink" of every component, in isolation and in each
state.

- **Atoms:** `CanvasWall` in idle / selected / delivered / in review /
  resolved, plus `ToolButton`, `Switch` and `StepLabel`.
- **Molecules:** `EscalationCard` in all four states (sending, delivered, in
  review, resolved),
  `NumericStepper`, `PhotoEvidenceCapture`, `VoiceMemoToggle` and
  `ExpertAvailability`.
- **UI Elements:** `MeasurementPopover` (Change Measurement → Propose Correction), `LockedBadge`, the compact `EscalationPin`,
  the yellow `AttachmentBadge` paperclip, the ghost wall, `ElementBadges` precedence in context,
  and every `StatusToast` variant.

Interactive specimens log their callbacks in an event log at the bottom.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                  iPad layout shell; owns the store, composes organisms
│   ├── sandbox/page.tsx          isolated component workbench
│   ├── layout.tsx, globals.css   viewport meta, Tailwind theme tokens
├── store/
│   ├── useDeviationState.ts      escalation workflow store (selection, intercepted
│   │                             drafts + ghost_draft mode, submit, revoke with race
│   │                             guard, mock expert review)
│   └── deviationMachine.ts       lifecycle: transition table, revoke rule, labels
├── components/
│   ├── atoms/                    CanvasWall, FloatingAnchor, LockedBadge, ToolButton,
│   │                             IconButton, Switch, StepLabel
│   ├── molecules/                EscalationCard, EscalationPin, MeasurementPopover,
│   │                             NumericStepper, PhotoEvidenceCapture,
│   │                             VoiceMemoToggle, CanvasControls, ExpertAvailability
│   └── organisms/                TopBar, DeviceStatusBar, LeftToolbar, CanvasArea,
│                                 FloorPlan, RightSidebar, EscalationDraftPane,
│                                 RoomDefaultSidebar, StatusToast,
│                                 DevToolsPanel, IPadFrame
└── lib/                          floor plan data + geometry, types, layout constants,
                                  hooks (voice recorder, Munich cutoff), cn() helper
```

State is in memory only (no backend). Reloading the page resets the demo.

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

> This is a *Wizard of Oz* prototype: exactly two interaction paths are
> wired up end to end, to demonstrate the UX concept. Every other tool stays
> locked and explains why when tapped.

### Path 1: "The measurement is off"

1. Tap the **4.55** dimension above the North wall (the only interactive
   dimension; it's tinted blue).
2. magicplan's **Change Measurement** popover opens: the value sits in a
   disabled field, and the one action is **🔒 Propose Correction**.
3. The popover closes and the draft opens: *Proposing · Dimension Mismatch ·
   North wall · plan 4.55 m*. Enter the laser reading under **Measured
   Length** (numpad, or − / + in 5 cm steps); the line below shows the
   difference ("−20 cm vs plan").

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

### Both paths

- **Evidence (at least one photo) is mandatory**: the + tile opens the iPad's
  rear camera; on a laptop use *"No camera? Use demo photo"*. Voice memo is
  optional; *Work is blocked here* is on by default.
- **Send to review** stays disabled until there's a length above 0 and a
  photo, and its label names what's missing ("Add length + photo"). Budget
  (€40k), permit status and a plan snapshot are attached automatically and
  shown above it.
- After sending, the pane closes **right away**. The North wall locks in a
  **red hatched pattern** with a status pin; the ghost stays on the plan in
  its status colour. Both appear in **Active Escalations** on the room
  panel, and the contractor moves on.
- While a draft is open, tapping another element on the canvas discards it
  (a toast says so) and selects that element instead.

**Canvas badges:** an element with standard Photos & Notes shows magicplan's
yellow paperclip. If it's also escalated, only the escalation pin shows (red,
amber or green): the blocker always wins.

The top bar shows how long the remote expert is still available (live
countdown to 15:00 Europe/Berlin).

---

## Presenter controls: deviation lifecycle and the revoke race

Each report moves through an explicit state machine (`lib/deviationMachine.ts`):

```
idle ─submit─▶ sending ─▶ delivered ─▶ in_review ─▶ resolved
 ▲                 │           │             ✕
 └──── revoke ─────┴───────────┘      revoke rejected
   (optimistic; confirmed by the server after network latency)
```

| State | Canvas | Escalation card |
|---|---|---|
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

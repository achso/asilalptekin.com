# magicplan · Field Escalation (iPad prototype)

A browser-based iPad app (landscape) that lets a contractor on site flag a
space problem **directly on the floor plan** and send it to the remote expert
in Munich: one-way, fire-and-forget, so they never wait on a reply.

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

## Demo script (≈ 60 seconds)

The permit is approved, so the plan is in its **execution state**: the header
shows **🔒 Locked (Permit Approved)** and the geometry is read-only.

1. **Try a tool in the left toolbar.** In the room view it shows magicplan's
   room actions (Insert, Set Size, Edit Layout, Duplicate, Delete). With a wall
   or corner selected it shows the drafting tools (Insert, Add Corner, Add
   Wall, Split Room, Delete). All of them are disabled; tapping one shows a
   toast explaining that the plan is locked for execution.
2. **Nothing is selected yet, so there's no Report Deviation button.** A
   report has to be anchored to geometry. The sidebar shows the **Music Room**
   panel (statistics, dimensions, affected areas, general), read-only
   throughout the execution phase: no steppers or chevrons, disabled inputs
   and switch, and a note on how to escalate. While any report is unresolved,
   its full **EscalationCard** (photo, issue, status, Revoke) sits at the top
   of that panel, with no extra click to reach the ticket.
3. **Tap a wall, a corner, or the floor (the whole room).** It highlights, the
   sidebar shows the read-only **Details / Photos & Notes / Forms** inspector,
   and **📍 Report Deviation** animates in at the top of the left toolbar, the
   only entry point. Nothing floats over the plan. The button hands the anchor
   (`{ type, id }`) to the form.
4. Tap **Report Deviation**. The button stays in place as the pressed,
   current mode (the toolbar never shifts). The canvas keeps driving
   selection: tapping another wall, corner, the floor or empty canvas discards
   the draft (a toast says so) and shows that element instead. The right
   sidebar becomes the **Escalation Form**,
   and the canvas stays visible with the wall highlighted. Nothing needs a
   keyboard:
   - **Issue type:** four options, each a bold title with a one-line
     description: Dimension Mismatch, Undocumented Element, Element Not on
     Site, Structural Obstacle. *Dimension Mismatch* adds **Measured on site**:
     tap the value to type a laser reading on the iPad numpad (e.g. 4.12), or
     nudge it with − / + in 5 cm steps.
   - **Evidence (at least one photo required).** magicplan's own Photos &
     Notes layout: a + tile (opens the iPad's rear camera), up to 7 photos and
     a free-text note. On a laptop, use *"No camera? Use demo photo"*.
   - **Record Voice Memo (optional).** Tap to talk, tap to stop.
   - **Work is blocked here** toggle.
   - **Send to review** stays disabled until the issue type and photo are
     provided, and its label says what's missing.
5. After sending, the form closes **right away**. The wall locks in a **red
   hatched pattern** with a compact **status pin** (red lock) on the wall
   (Sending → Delivered), and it appears in **Active Escalations**. The
   contractor moves on.

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

1. Report a wall and wait for **Delivered**.
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
- **Molecules:** `EscalationCard` (delivered next to in review),
  `IssueTypePicker`, `NumericStepper`, `PhotoEvidenceCapture`, `VoiceMemoToggle` and
  `ExpertAvailability`.
- **UI Elements:** `ReportDeviationAction`, `LockedBadge`, the compact `EscalationPin`,
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
│   ├── useDeviationState.ts      escalation workflow store (selection, submit,
│   │                             revoke with race guard, mock expert review)
│   └── deviationMachine.ts       lifecycle: transition table, revoke rule, labels
├── components/
│   ├── atoms/                    CanvasWall, FloatingAnchor, LockedBadge, ToolButton,
│   │                             IconButton, Switch, StepLabel
│   ├── molecules/                EscalationCard, ReportDeviationAction, EscalationPin,
│   │                             IssueTypePicker, NumericStepper, PhotoEvidenceCapture,
│   │                             VoiceMemoToggle, CanvasControls, ExpertAvailability
│   └── organisms/                TopBar, DeviceStatusBar, LeftToolbar, CanvasArea,
│                                 FloorPlan, RightSidebar, DeviationForm, StatusToast,
│                                 DevToolsPanel, IPadFrame
└── lib/                          floor plan data + geometry, types, layout constants,
                                  hooks (voice recorder, Munich cutoff), cn() helper
```

State is in memory only (no backend). Reloading the page resets the demo.

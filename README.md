# magicplan · Field Escalation (iPad prototype)

A browser-based iPad app (landscape) that lets a contractor on site flag a
space problem **directly on the floor plan** and send it to the remote expert
in Munich: one-way, fire-and-forget, so they never wait on a reply. The plan
is locked, so ordinary CAD actions (Insert, Add Wall, Delete…, editing a
dimension) are intercepted and turned into proposals.

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
shows **🔒 Locked (Permit Approved)** and the geometry is read-only. There is
no separate "Report Deviation" button. The contractor does what they'd do in
magicplan anyway, the locked plan **intercepts** it, and an **Escalation
Draft** slides into the right sidebar with the intent already filled in. They
never pick an issue type from a list.

| What the contractor does | Becomes |
|---|---|
| **Insert** → native *All Objects* menu → a category, then tap the plan | Undocumented Element, category preset, at that spot |
| **Add Wall** (wall selected), then tap the plan | Undocumented Element, preset to Structural |
| **Delete…** with a wall or corner selected | Element Not on Site for that element |
| **Set Size** (room view) | Dimension Mismatch on the room: Measured Width + Measured Length |
| Tap a locked dimension (✎) in the sidebar: wall Length, room Width / Length, Ceiling Height | Dimension Mismatch on exactly that dimension |

Edit Layout, Duplicate, Add Corner and Split Room have no on-site meaning:
they stay locked, and a tap explains why.

1. **Insert → Plumbing.** The menu is magicplan's own category list, top level
   only. The canvas switches to `ghost_draft`: a red prompt says *Tap where
   the Plumbing item is* (✕ cancels). Tap inside the room and a red, dashed,
   semi-transparent **Ghost Object** with the plumbing glyph drops there.
   Tap again to move it.
2. The **Escalation Draft** opens: *Proposing · New Plumbing*. Category is
   preselected (changeable), Location shows the distances from the west and
   north walls, and *Measured on site* asks for what that category needs:
   - Structural: length of the physical wall (walls run floor to ceiling).
   - Doors, Windows, Appliances, Cabinets: width + height.
   - Plumbing, Electrical, Furniture, HVAC: length + height (boxed-in pipes or
     ducts stop below the ceiling, and that height decides what still fits).
   - Annotations, Outdoors: length.

   Fields start empty (0.00); heights are capped at the 3.12 m ceiling.
3. **Evidence (at least one photo) is mandatory** for every proposal: the +
   tile opens the iPad's rear camera; on a laptop use *"No camera? Use demo
   photo"*. Voice memo is optional; *Work is blocked here* is on by default.
4. **Send to review** stays disabled until everything is there, and its label
   names the next gap ("Add height + photo"). Budget (€40k), permit status
   and a plan snapshot are attached automatically and shown above it.
5. After sending, the pane closes **right away**. The Ghost Object stays on
   the plan in its status colour; a challenged wall locks in a **red hatched
   pattern** with a status pin. The proposal appears in **Active
   Escalations**, and the contractor moves on.
6. **Tap Ceiling Height (✎) in the Music Room panel**: *Proposing · Dimension
   Change · Ceiling Height · plan 3.12 m*, one *Measured Ceiling Height*
   input. Select a wall and tap its Length for *Wall Length*; **Set Size**
   asks for the room's width and length, each against its plan value.
7. **Select the east wall → Delete…**: *Proposing · Element Not on Site*.
   Only a photo is needed. The wall stays on the plan.

While a draft is open, tapping another element on the canvas discards it (a
toast says so) and selects that element instead. One element can carry
several open proposals (e.g. a wall's length and a missing element).

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

1. Send a proposal (e.g. Delete… on a wall) and wait for **Delivered**.
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
  `CategoryChips`, `NumericStepper`, `PhotoEvidenceCapture`, `VoiceMemoToggle` and
  `ExpertAvailability`.
- **UI Elements:** `ProposableValue` (a locked dimension you can challenge), `LockedBadge`, the compact `EscalationPin`,
  the yellow `AttachmentBadge` paperclip, the `GhostMarker`, `ElementBadges` precedence in context,
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
│   │                             IconButton, Switch, StepLabel, ObjectCategoryIcon,
│   │                             GhostMarker
│   ├── molecules/                EscalationCard, EscalationPin, ProposableValue,
│   │                             CategoryChips, NumericStepper, PhotoEvidenceCapture,
│   │                             VoiceMemoToggle, CanvasControls, ExpertAvailability
│   └── organisms/                TopBar, DeviceStatusBar, LeftToolbar, CanvasArea,
│                                 FloorPlan, RightSidebar, EscalationDraftPane,
│                                 RoomDefaultSidebar, StatusToast,
│                                 DevToolsPanel, IPadFrame
└── lib/                          floor plan data + geometry, types, layout constants,
                                  hooks (voice recorder, Munich cutoff), cn() helper
```

State is in memory only (no backend). Reloading the page resets the demo.

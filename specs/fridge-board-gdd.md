# CheenaSims Minigame — Game Design Document

> Phase 2 GDD — The Fridge Board

---

## Identity

| Field | Value |
|---|---|
| **Game Name** | The Fridge Board |
| **Tagline** | "Leave your mark." |
| **Game Type** | Original — shared interactive object / public message board |
| **Complexity Tier** | Medium (drag & drop, real-time PocketBase sync, custom cursor) |
| **Target Play Time** | Open-ended — no session limit |
| **Occasion / Context** | Any time either player (or any visitor) opens the game; asynchronous shared space |
| **Art Style Direction** | Unique — Hyper-realistic. Photo-texture white refrigerator, glossy surface, realistic magnet shadows and depth. Kitchen does NOT need to be shown; fridge fills the viewport. |

---

## Game Identity

**What is this game trying to make the player feel or do?**
> Feel like they left a little mark on a shared space — a playful public corkboard. Visiting the fridge should feel like walking up to the fridge in a shared apartment and seeing what someone wrote last night.

**Core verb:**
> Arrange / spell / leave

---

## Rules & Conditions

**How do you play? (plain language)**
> Open the minigame and you see a large white refrigerator. Two permanent magnets live on it: a trash-can icon and an "ABC" button. Click "ABC" to open the letter picker overlay — a translucent panel showing all 26 letters in the colors they will appear as on the fridge. Click any letter to spawn a copy of it as a draggable magnet. Drag magnets anywhere on the fridge to arrange words or art. Drag a magnet onto the trash-can magnet to delete it. All magnet positions and colors sync in real time across all players and persist across sessions via PocketBase.

**Win condition:**
> None.

**Lose condition:**
> None.

**Points system:**
> No.

**Time limit:**
> No.

**Difficulty levels:**
> No.

**Multiple levels/stages:**
> No.

---

## Controls

| Input | Action |
|---|---|
| Click "ABC" magnet | Open letter picker overlay |
| Click letter in picker | Spawn that letter magnet onto the fridge; close overlay |
| Press Escape / click outside picker | Close picker without spawning |
| Click & drag any letter magnet | Move it; position saves to PocketBase on drop |
| Drag letter magnet onto trash magnet | Delete that magnet (removed from PocketBase) |
| Click trash magnet (no drag) | No action — trash is only a drop target |

**Mobile touch support needed?** Yes — touch drag must mirror mouse drag behavior.

---

## Synopsis

> You open a refrigerator door that fills your entire screen. It's spotless, white, and glossy — except for a little trash can magnet in the corner and a chunky "ABC" tile. You click ABC. A translucent bubble slides in showing 26 alphabet letters, each glowing in its own color. You click the letters you want and drag them into place. Someone else — maybe playing right now, maybe hours from now — will see exactly what you left. The fridge remembers everything.

---

## Screens & Flow

```
[Load → Fridge Screen (persistent, no end state)]
```

No title screen, no win/lose screen. The fridge IS the game. On load: fetch all magnet records from PocketBase, render them in saved positions, subscribe to real-time updates.

**Overlay state:** letter picker panel (translucent dark background, 5×6 grid of letters A–Z, closes on pick or escape).

---

## Letter Color Assignment

Each letter has one fixed color drawn from the curated palette, assigned deterministically by the letter's index (A=0, B=1, … Z=25) cycling through the palette:

**Palette:** `red`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| red | orange | yellow | green | blue | purple | pink |
| H | I | J | K | L | M |
| red | orange | yellow | green | blue | purple |
| … (cycles) |

This means the picker always shows the same color per letter — the picker acts as a live preview of how the magnet will look.

Multiple copies of the same letter can be spawned (for repeated letters in words).

---

## Assets Required

### Sprites / Characters
| Asset | Description | Source |
|---|---|---|
| Trash can magnet | Realistic fridge-magnet style trash icon, ~60×70px | OpenAI gen |
| ABC magnet | Chunky rectangular magnet tile with "ABC" text, fridge-magnet style | OpenAI gen |
| Letter magnets A–Z | Individual letter tiles, each in its assigned color, fridge-magnet style with slight 3D bevel | OpenAI gen (one sheet) |
| Hand cursor | Custom arm/hand cursor — placeholder for now; user will photograph animation frames later | Placeholder CSS cursor |

### Backgrounds / Scenes
| Asset | Description | Source |
|---|---|---|
| Fridge surface | Full-viewport hyper-realistic white refrigerator front — glossy, slight reflections, clean | OpenAI gen |

### UI Elements
| Asset | Description |
|---|---|
| Letter picker overlay | Translucent dark panel, 5×6 letter grid, rounded corners — built in CSS/HTML |
| Title banner | 200×80px cozy pixel art sign for CheenaSims world map entry point |

### Audio (optional)
| Asset | Description |
|---|---|
| Magnet place sound | Soft magnetic "click" — optional, low priority |

---

## PocketBase Schema

**Collection: `fridge_magnets`**

| Field | Type | Notes |
|---|---|---|
| `id` | Auto | PocketBase default |
| `letter` | Text | Single char A–Z |
| `color` | Text | CSS color string from palette |
| `x` | Number | % of fridge width (0–100) |
| `y` | Number | % of fridge height (0–100) |
| `z_order` | Number | Increments on each drop to keep last-moved on top |

Permanent magnets (trash, ABC) are hardcoded in the HTML — not stored in PocketBase.

Real-time sync: subscribe to PocketBase `fridge_magnets` collection using SSE/realtime API. On `create`, `update`, `delete` events, reflect changes immediately for all connected clients.

---

## Custom Cursor Plan

- Phase 4 implementation: use a CSS `cursor: url(hand-placeholder.png)` default
- Post-photo: user photographs their arm/hand in required animation frames (hovering, gripping, dragging, releasing), Claude will swap in the real images and wire up cursor state changes via JS `mouseover`, `mousedown`, `mouseup` events on magnet elements

---

## CheenaSims Integration

**Scene trigger that launches this game:**
> Interacting with the fridge object in the CheenaSims kitchen scene (or whichever room the fridge is placed in).

**postMessage result handling:**
> Since there is no win/lose, emit on user-initiated close/exit only:
> `{ type: "MINIGAME_END", result: { won: false, score: 0 } }`
> No special unlock or trophy needed — the fridge is ambient / always-on.

**Title banner filename:**
> `banner_fridge_board.png`

---

## Implementation Notes

- Magnet z-ordering: on `mousedown`/`touchstart`, set the dragged magnet's `z_order` to `max(all z_orders) + 1` so it always renders on top while being dragged.
- Trash hit detection: detect overlap between dragged magnet's bounding box and trash magnet position on `mouseup`/`touchend` — if overlapping, delete from PocketBase.
- Drag constraints: clamp x/y so magnets cannot be dragged off the visible fridge surface.
- Real-time collision: if two clients move the same magnet simultaneously, last-write-wins via PocketBase update.
- Mobile: use `touchstart`/`touchmove`/`touchend` events; prevent default scroll on drag.
- Letter picker: clicking ABC while picker is open closes it (toggle behavior).
- PocketBase URL: `http://minecraftserver:8091` (Tailscale hostname, port 8091 confirmed). Collection `fridge_magnets` created and verified.

---

*GDD version: 1.0 — CheenaSims Minigame Skill*

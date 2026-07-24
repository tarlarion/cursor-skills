---
name: icon-animation-playground
description: >-
  Builds an animated-icons playground: soft dashboard UI, left params, gallery
  previews, fixed timeline dock with editable state intervals, SVG upload, and
  Save to source. Use when the user says playground, icon playground, animated
  icons playground, animation params, icon timeline, Add SVG, or Save to source.
---

# Icon animation playground

Create a **dev playground** to preview and tune animated SVG icons — not a production page.

Canonical prior art: `~/Documents/http/AAIWorkshop/` (`components/playground.js`, `icon-definitions.js`, `motion-definitions.js`, `animated-icon.js`).

Canonical Next.js implementation (this skill’s target shape): `aaiworkshop-draft` at `/playground`.

## When to use

- User asks for an icon animation playground / preview lab
- Adding or tuning CSS/SVG animated icons and needs live params + timeline
- Porting the AAIWorkshop playground into another stack (vanilla, Next.js, etc.)
- User wants Add SVG, Save to source, or editable timeline state intervals

## Layout (required)

```
┌──────────────────────────────────────────────────────────┐
│ Pill topbar: coral mark · Add SVG · Save · Stop · Play   │
├─────────────────┬────────────────────────────────────────┤
│ LEFT CARD       │ GALLERY CARD                           │
│ Animation params│ All animated icon previews             │
│ · icon / trigger│ each cell: icon ABOVE name + motion pill│
│ · delay / move  │ selected = ink ring; Add SVG in header │
│ · settle / size │ no stage bg/border                     │
│ · metric chips  │                                        │
│ · resolved dump │                                        │
├─────────────────┴────────────────────────────────────────┤
│ FIXED BOTTOM TIMELINE DOCK (chevron collapse)            │
│ tracks + editable state markers/intervals · ruler · head │
│ (NO Delay/Move segment bar / presets strip in dock)      │
└──────────────────────────────────────────────────────────┘
```

| Region | Must show |
|--------|-----------|
| **Left menu** | Editable animation params + resolved param dump + keyframes for selected icon |
| **Content area** | **All** registered animated icons as live previews |
| **Header** | Add SVG, Save to source, Play, Stop |
| **Timeline dock** | Tracks, ruler, playhead; editable middle state markers + per-interval ms |

Clicking a preview selects that icon and refreshes params + timeline. Timing edits in the left panel apply to the selected icon (shared state across gallery players).

## Visual design (required)

Match the soft dashboard language (reference: [design-reference.png](design-reference.png)). Do **not** ship a flat bordered admin form.

### Tokens

```css
--pg-bg: #f5f7fb;
--pg-card: #ffffff;
--pg-ink: #1c1f26;
--pg-muted: #8b93a7;
--pg-line: #e8ecf3;
--pg-soft: #f1f4f9;
--pg-blue: #2f65e4;
--pg-coral: #ff6b4a;
--pg-shadow: 0 12px 40px rgba(28, 31, 38, 0.06);
--pg-radius: 24px;
```

### UI rules

- Full-page canvas `--pg-bg`; floating white cards (`--pg-radius`, `--pg-shadow`) — no hard card borders
- **Pill topbar** (radius 999): coral circular logo mark + kicker/title; ghost actions + dark primary Play
- **Pill controls**: selects/inputs radius 999 on soft fill; metric chips; motion/status pills
- **Gallery**: soft tile; **icon above** name + motion pill; selected = `0 0 0 2px var(--pg-ink)`; stage has no bg/border
- **Timeline dock**: fixed full-width bottom; **chevron** circular toggle (not text Collapse/Expand); pad page with `--timeline-dock-pad`; hide scrollbars on params/timeline
- Playhead accent `--pg-coral`
- Avoid purple gradients, multi-layer shadows, emoji, dense table chrome

## Architecture (required split)

Do **not** hardcode one SVG into the playground page. Keep three layers:

1. **Definitions** — `registry.ts`: paths / `structuredMarkup`, fills, `motion`, label, optional `viewBox`, `preserveFills`
2. **Motions** — `motions.ts`: named motions, tracks, `buildAnimationParams`, keyframe ATS helpers, `buildDynamicMotionCss`
3. **Player** — `animated-icon.tsx`: CSS vars, idle/playing, triggers, `play()` / `stop()`, optional `keyframeTracks`

Also:

- `timing-defaults.ts` — `SHARED_TIMING_DEFAULTS` + `MOTION_TIMING_DEFAULTS`
- `parse-uploaded-svg.ts` — local SVG → custom definition
- Playground UI — params, gallery, timeline, Save / Add SVG

### Triggers

`manual` | `load` | `hover` | `click` | `focus`.

Replay:

```js
root.classList.remove('is-playing')
void root.offsetWidth
root.classList.add('is-playing')
```

### Timing model

Defaults in `timing-defaults.ts` (not hardcoded magic numbers in the player).

```
delay = 400ms
moveDuration = 500ms
settleDuration = 800ms
size = 24
```

**Save to source** (dev only): write current delay/move/settle/size into `timing-defaults.ts` (shared + selected motion). For `forward-slide`, also patch `forward-card-icon.tsx` defaults. Disabled in production. Prefer rewriting the whole `timing-defaults.ts` file from a template (avoid fragile regex patches that can wipe `MOTION_TIMING_DEFAULTS`).

For move+settle motions:

```
exit% = moveDuration / (moveDuration + settleDuration) × 100
```

Timeline markers and CSS keyframes **must** share this calculation.

Changing delay/move/settle in the left panel **clears** that icon’s timeline keyframe overrides so params stay the source of truth.

### Timeline state editing (required)

Per track (`bg`, `foreground`, …):

- Start/end markers locked; **middle** markers draggable
- Under each track: interval inputs `label → next` in **ms**
- Helpers: `getTrackAts`, `applyAtsToTrack`, `clampKeyframeAts`, `setTrackIntervalMs`
- Store overrides as `Record<iconName, KeyframeAtsByTrack>`
- Pass `keyframeTracks` to the player **only when that icon has overrides**

### Keyframe CSS scoping (critical)

`@keyframes` names are **document-global**. Never inject unscoped shared names (`arrow-full`, `bg-fade-in`, …) from every gallery cell — the last cell overwrites all others (this broke Phone · filled arrow).

Rules:

1. Default path: static CSS in the player stylesheet, plus scoped dynamic CSS only for settle motions (`data-kf` + unique names like `${scopeId}-arrow-full`)
2. Override path: `buildDynamicMotionCss({ scopeId, motion, … })` emits **only that motion’s** keyframes, prefixed with `scopeId`, plus rules under `.animated-icon__root[data-kf="…"]`
3. Do **not** pass `keyframeTracks` to every icon by default

### Add SVG (session custom icons)

- Header + gallery **Add SVG** → file input `.svg`
- `parseUploadedSvg`: sanitize, prefer top-level groups, bake inherited fills, set `structuredMarkup` + `preserveFills` + `viewBox`
- Motion hint: 2+ layers → `forward-slide`, else `scale-pop`
- Custom icons live in React state (`customIcons`); `getIconList(customIcons)` / `getIconDefinition(name, customIcons)`
- Uploads are **in-memory** unless a separate write-to-registry action is requested

### Animation rules (short)

- Split layers before keyframes
- Prefer `transform` + `opacity`
- Fixed stage + clip; no layout shift
- Idle + playing states; exaggerate assembly gaps when parts join

Full principles: [principles.md](principles.md). Details: [reference.md](reference.md).

## Workflow

```
Task Progress:
- [ ] Detect stack and playground path
- [ ] Ensure registry + motions + player + timing-defaults exist
- [ ] Scaffold soft-dashboard shell (params / gallery / fixed dock)
- [ ] Wire gallery of all icons (definition + optional custom uploads)
- [ ] Wire left params ↔ state ↔ players
- [ ] Wire Play / Stop + playhead (DOM ref, not per-frame React state)
- [ ] Wire timeline state markers + interval ms (scoped keyframes)
- [ ] Wire Add SVG + Save to source (dev)
- [ ] Verify: select icon, edit timing/states, play; other icons keep correct motions
```

### Stack defaults

| Project | Put playground at |
|---------|-------------------|
| Vanilla (like AAIWorkshop) | `index.html` + `components/playground.js` |
| Next.js App Router | `src/app/playground/page.tsx` (dev-only; no marketing nav link unless asked) |

### Registering a new icon

1. Add definition (paths or structured markup + `motion` + label)
2. Reuse or add a **named** motion
3. Gallery picks it up via registry — no playground hardcoding
4. Confirm idle/playing, triggers, timeline tracks, scoped CSS

## Play / Stop / timeline behavior

**Play** — `selectedPlayer.play()` + RAF playhead `0 → totalDuration` (drive playhead via DOM ref).

**Stop** — cancel RAF, `stop()`, hide/reset playhead.

**Timeline dock**

- Chevron collapse only (no segment Delay/Move bar, no Fast/Default/Slow strip in dock — those live in left params if needed)
- Tracks: delay gutter + bar + markers
- Editable middle markers + interval ms rows
- Ruler ticks at 0, delay, delay+move, (+settle), total

## Done criteria

- Soft dashboard layout matches tokens / reference image
- Left params + resolved dump for selected icon
- Gallery shows every registered (+ uploaded) icon
- Play/Stop + playhead correct for `totalDuration`
- Timeline state edits update that icon’s motion without breaking others
- Save to source updates `timing-defaults.ts` in dev
- Add SVG mounts a playable custom icon in-session

## Do not

- Ship playground as the product homepage unless asked
- Hardcode a single SVG in the playground page
- Desync timeline `%` from editable durations / ATS overrides
- Inject unscoped global `@keyframes` from each gallery cell
- Animate layout properties (`width`, `height`, `top`, `left`, `margin`) on icons
- Reintroduce the dock Delay/Move segment editor unless the user asks for it back

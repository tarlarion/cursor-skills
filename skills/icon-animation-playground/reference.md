# Playground reference

Details for implementing the icon animation playground.

Canonical behavior source: AAIWorkshop + the Next.js `/playground` shape documented in `SKILL.md` (soft dashboard, fixed dock, state editing, SVG upload, Save to source).

## Visual design

Canonical look: soft dashboard cards (see `design-reference.png`).

### Tokens

| Token | Value |
|-------|-------|
| `--pg-bg` | `#f5f7fb` |
| `--pg-card` | `#ffffff` |
| `--pg-ink` | `#1c1f26` |
| `--pg-muted` | `#8b93a7` |
| `--pg-line` | `#e8ecf3` |
| `--pg-soft` | `#f1f4f9` |
| `--pg-blue` | `#2f65e4` |
| `--pg-coral` | `#ff6b4a` |
| `--pg-shadow` | `0 12px 40px rgba(28, 31, 38, 0.06)` |
| `--pg-radius` | `24px` |

### Structure classes

| Class | Role |
|-------|------|
| `.playground-shell` | Full-viewport `--pg-bg` canvas |
| `.playground-topbar` | Pill header with coral logo mark |
| `.card` / `.params-card` / `.gallery-card` | Floating white panels |
| `.pill` / `.pill-btn` / `.btn-primary` / `.btn-ghost` | Capsule controls |
| `.gallery-cell` | Soft tile; icon stage **above** name + motion pill |
| `.preview-stage` | Fixed stage, no bg/border |
| `.timeline-dock` | Fixed full-width bottom dock |
| `.timeline-collapse-btn` | Circular chevron toggle (`aria-expanded`) |
| `.timeline-marker.is-editable` | Draggable middle state handle |
| `.timeline-intervals` / `.timeline-interval` | Per-interval ms editors |
| `.timeline-playhead-line` | Coral playhead |

### Gallery cell order

1. Icon preview stage  
2. Name  
3. Motion pill  

Selected: `box-shadow: 0 0 0 2px var(--pg-ink)`.

### Timeline dock

- `position: fixed; left: 0; right: 0; bottom: 0`
- Page padding-bottom: `--timeline-dock-pad` (shrink when collapsed)
- Chevron rotates when collapsed; body uses `hidden`
- Hide scrollbars on `.params-card` and `.timeline-card`
- **Do not** put Delay/Move segment bar or Fast/Default/Slow presets in the dock unless requested

## State

```ts
interface PlaygroundState {
  selectedIcon: string
  trigger: 'manual' | 'load' | 'hover' | 'click' | 'focus'
  delay: number
  moveDuration: number
  settleDuration: number
  size: number
}

// Session-only
customIcons: Record<string, IconDefinition>
keyframeOverrides: Record<string, KeyframeAtsByTrack>
```

```ts
type TrackPartKey = 'bg' | 'foreground' | 'color'
type KeyframeAtsByTrack = Partial<Record<TrackPartKey, number[]>>
```

Rebuild display params via `buildAnimationParams` + `applyAtsToTrack` for overrides.

## Left menu — editable controls

| Control | Binding |
|---------|---------|
| Icon | `selectedIcon` (also gallery) |
| Trigger | `trigger` |
| delay / move / settle / size | timing fields (settle hidden if `!usesSettle`) |

Metric chips: delay / move / total.

Changing delay/move/settle clears `keyframeOverrides[selectedIcon]`.

## Left menu — resolved dump

From `buildAnimationParams` (+ overrides applied to tracks):

- Icon, Motion, Trigger, Size, `common.delay`
- Per part: animation, duration, easing, idle
- Keyframe sections with `at%`, label, props
- `total duration`

## Content area — gallery

```
for each icon in getIconList(customIcons):
  cell:
    - AnimatedIcon(definition, keyframeTracks only if overrides[icon])
    - name + motion pill below
```

Stage: `max(72, size * 2)`, `contain: layout`.

## Header actions

| Button | Action |
|--------|--------|
| Add SVG | Open file picker → `parseUploadedSvg` → `customIcons` + select |
| Save to source | Dev server action → rewrite `timing-defaults.ts` (+ `forward-card-icon` for `forward-slide`) |
| Play / Stop | Selected player + playhead RAF |

## Timeline — state editing

### Tracks

```
[ label ] [ delay gutter | bar with markers ]
[ interval chips: start → next  [ms] ]
```

Marker left: `(frame.at / 100) * barRatio * 100%` where  
`barRatio = partDuration / (totalDuration - delay)`.

- Index `0` and last: locked markers  
- Middle: `pointerdown` drag → `clampKeyframeAts` → `commitPartAts`  
- Interval input → `setTrackIntervalMs(ats, i, ms, partDuration)`

For `arrow-full`, dragging/editing the `exit` foreground keyframe may sync `moveDuration` / `settleDuration` from exit%.

### Playhead

Drive via DOM ref (avoid React state every frame):

```js
function playAnimation() {
  cancelPlayhead()
  selectedPlayer.play()
  const start = performance.now()
  const total = params.timing.totalDuration
  function tick(now) {
    const progress = Math.min((now - start) / total, 1)
    playhead.hidden = false
    playhead.style.left = `${progress * 100}%`
    if (progress < 1) playheadFrame = requestAnimationFrame(tick)
    else { playheadFrame = null; playhead.hidden = true }
  }
  playheadFrame = requestAnimationFrame(tick)
}
```

## Keyframe CSS scoping

**Bug to avoid:** injecting `@keyframes arrow-full` (etc.) from every gallery `AnimatedIcon` overwrites document-global names → wrong motion on Phone · filled arrow / siblings.

**Required pattern:**

1. Each player root has `data-kf="{uniqueScopeId}"` (from `useId`)
2. Dynamic CSS uses names `${scopeId}-arrow-full`, … and selectors  
   `.animated-icon__root[data-kf="${scopeId}"].is-playing … { animation-name: … }`
3. `buildDynamicMotionCss` takes `{ scopeId, motion, bg, foreground, color? }` and emits **only** that motion’s blocks
4. Pass `keyframeTracks` **only** when `keyframeOverrides[icon]` exists; otherwise use default stylesheet (+ scoped settle CSS for `arrow-full`)

## SVG upload

`parseUploadedSvg(svgText, fileName)`:

- Strip scripts / event handlers
- Prefer ≥2 top-level graphics as `bg` + `arrow-group`; bake inherited fills
- Return `{ name, definition }` with `structuredMarkup`, `preserveFills: true`, `viewBox`
- Player renders `structuredMarkup` via `dangerouslySetInnerHTML` when present; omit forced `fill="none"` when `preserveFills`

## Timing defaults + Save to source

File: `src/components/icons/timing-defaults.ts`

```ts
SHARED_TIMING_DEFAULTS
MOTION_TIMING_DEFAULTS[motion]
resolveTimingDefaults(motion)
```

Server action (dev only): rebuild entire file contents (shared + all motion entries). Do not regex-replace a single block in a way that can delete `MOTION_TIMING_DEFAULTS`.

## File map (Next.js)

```
src/components/icons/registry.ts
src/components/icons/motions.ts
src/components/icons/timing-defaults.ts
src/components/icons/parse-uploaded-svg.ts
src/components/icons/animated-icon.tsx
src/components/icons/animated-icon.css
src/components/playground/icon-playground.tsx
src/app/playground/page.tsx
src/app/playground/actions.ts          # saveTimingDefaultsToSource
```

## File map (vanilla workshop)

```
components/icon-definitions.js
components/motion-definitions.js
components/animated-icon.js
components/playground.js
index.html
```

## Porting checklist

1. Port definitions + motions + player (not CSS alone)
2. Soft dashboard: params left / gallery / fixed chevron dock
3. `buildAnimationParams` single source for params + timeline
4. Scoped keyframes; overrides opt-in per icon
5. Playhead duration === `params.timing.totalDuration`
6. Add SVG + Save to source if the host stack is Next/dev

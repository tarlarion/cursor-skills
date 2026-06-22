---
name: lottie-animation
description: Integrates, optimizes, and debugs Lottie animations in web apps and Telegram Mini Apps. Covers lottie-web, dotlottie, lottie-react, asset workflow, performance, and accessibility. Use when the user mentions Lottie, .json/.lottie animation assets, Bodymovin, LottieFiles, or wants to add or fix vector animations.
disable-model-invocation: true
---

# Lottie Animation

## When to use Lottie

Use Lottie for designer-authored vector animations (loading, celebrations, icons, onboarding).

Prefer CSS/SVG when:
- Animation is simple (fade, scale, rotate)
- File size would exceed ~50–80 KB for a small UI element
- You need pixel-perfect control without After Effects

## Library choice

| Context | Default library | Notes |
|---------|-----------------|-------|
| Vanilla HTML/JS | `@lottiefiles/dotlottie-web` | Smaller runtime; `.lottie` assets |
| Vanilla fallback | `lottie-web` | Widest compatibility; `.json` assets |
| React | `lottie-react` | Thin wrapper over `lottie-web` |
| React (player UI) | `@lottiefiles/react-lottie-player` | Built-in controls, lazy load |

Default to **dotlottie** for Telegram Mini Apps and mobile-first apps. Fall back to `lottie-web` when the asset is JSON-only or features are unsupported.

## Workflow

```
Task Progress:
- [ ] Confirm animation purpose and target screen
- [ ] Choose library and renderer
- [ ] Add/optimize asset
- [ ] Implement with lifecycle cleanup
- [ ] Add reduced-motion and accessibility handling
- [ ] Verify size and frame rate on target device
```

### 1. Asset preparation

1. Export from After Effects via [LottieFiles plugin](https://lottiefiles.com/plugins/after-effects) or Bodymovin.
2. Optimize at [LottieFiles Optimizer](https://lottiefiles.com/tools/lottie-json-to-dotlottie) — target **< 30 KB** for UI accents, **< 100 KB** for hero/celebration.
3. Store in `assets/lottie/` (or project convention). Use `.lottie` when possible.
4. Remove unused layers, raster images, and expressions before export.

### 2. Vanilla implementation (dotlottie)

```html
<div id="hero-lottie" class="lottie-host" aria-hidden="true"></div>
```

```javascript
import { DotLottie } from '@lottiefiles/dotlottie-web'

let animation = null

function mountLottie(container, src, { loop = true, autoplay = true } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null

  animation = new DotLottie({
    canvas: document.createElement('canvas'),
    src,
    loop,
    autoplay,
  })
  container.replaceChildren(animation.canvas)
  return animation
}

function destroyLottie() {
  animation?.destroy()
  animation = null
}
```

### 3. Vanilla implementation (lottie-web)

```javascript
import lottie from 'lottie-web'

let animation = null

function mountLottie(container, path, { loop = true, autoplay = true, renderer = 'svg' } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null

  animation = lottie.loadAnimation({
    container,
    renderer, // 'svg' for crisp UI; 'canvas' for many layers
    loop,
    autoplay,
    path,
  })
  return animation
}

function destroyLottie() {
  animation?.destroy()
  animation = null
}
```

### 4. React implementation

```tsx
import Lottie from 'lottie-react'
import animationData from '@/assets/lottie/success.json'

function SuccessAnimation() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return null

  return (
    <Lottie
      animationData={animationData}
      loop={false}
      className="lottie-host"
      aria-hidden
    />
  )
}
```

Lazy-load heavy animations:

```tsx
const Lottie = lazy(() => import('lottie-react'))
```

## Telegram Mini App rules

1. **Bundle size** — prefer dotlottie; lazy-load non-critical animations after first paint.
2. **Lifecycle** — call `destroy()` when leaving a screen (TMA screens are often kept in DOM).
3. **Visibility** — `pause()` when screen is hidden; `play()` when shown.
4. **No autoplay spam** — one celebration animation per event; debounce retriggers.
5. **CDN** — self-host assets in the mini app bundle; avoid third-party CDN dependency in production.
6. **Haptics** — pair short Lottie moments with `Telegram.WebApp.HapticFeedback` only on user-triggered wins, not on load.

## Renderer selection

| Renderer | Use when |
|----------|----------|
| `svg` | Few layers, UI icons, sharp edges |
| `canvas` | Many layers, particles, complex scenes |
| `html` | Rare; text-heavy (avoid in TMA) |

## Accessibility

- Decorative animations: `aria-hidden="true"`.
- Meaningful animations: provide visible text equivalent nearby.
- Honor `prefers-reduced-motion: reduce` — skip or show static last frame.
- Do not rely on animation alone for feedback (pair with text/haptic).

## CSS host pattern

```css
.lottie-host {
  width: 100%;
  max-width: 240px;
  aspect-ratio: 1;
  margin-inline: auto;
  pointer-events: none;
}

.lottie-host canvas,
.lottie-host svg {
  width: 100%;
  height: 100%;
}
```

## Debugging checklist

- **Blank player** — CORS on JSON, wrong path, or container has zero size.
- **Janky playback** — switch renderer; reduce layers; lower frame rate at export.
- **Huge file** — convert to dotlottie; remove images; simplify paths.
- **Memory leak** — missing `destroy()` on navigation/unmount.
- **Wrong colors** — AE uses unsupported effects; flatten fills in source file.

## Additional resources

- Library API details and segment playback: [reference.md](reference.md)
- Copy-paste examples by scenario: [examples.md](examples.md)

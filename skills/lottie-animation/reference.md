# Lottie Reference

## Package install

```bash
# Vanilla / Vite
npm install @lottiefiles/dotlottie-web
# or
npm install lottie-web

# React
npm install lottie-react
# or
npm install @lottiefiles/react-lottie-player
```

## lottie-web API (common)

```javascript
const anim = lottie.loadAnimation({
  container: el,
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: '/assets/lottie/loader.json',
  // or: animationData: object
})

anim.play()
anim.pause()
anim.stop()
anim.setSpeed(1.5)
anim.goToAndStop(frame, true)
anim.goToAndPlay(frame, true)
anim.addEventListener('complete', onComplete)
anim.destroy()
```

### Segment playback

```javascript
anim.playSegments([0, 45], true) // frames 0–45, force flag
```

## dotlottie-web API (common)

```javascript
import { DotLottie } from '@lottiefiles/dotlottie-web'

const anim = new DotLottie({
  canvas: document.createElement('canvas'),
  src: '/assets/lottie/celebration.lottie',
  loop: false,
  autoplay: true,
})

anim.addEventListener('complete', () => {})
anim.play()
anim.pause()
anim.stop()
anim.setFrame(0)
anim.destroy()
```

## lottie-react props

| Prop | Type | Notes |
|------|------|-------|
| `animationData` | object | Inline JSON import |
| `path` | string | URL to JSON |
| `loop` | boolean \| number | `true` or loop count |
| `autoplay` | boolean | |
| `onComplete` | function | |
| `lottieRef` | ref | Imperative API access |

```tsx
const lottieRef = useRef(null)
<Lottie lottieRef={lottieRef} animationData={data} />
lottieRef.current?.playSegments([10, 60], true)
```

## Optimization targets

| Animation type | Target size | Max duration |
|----------------|-------------|--------------|
| Loader / spinner | 5–20 KB | loop |
| Icon micro-interaction | 3–15 KB | < 1 s |
| Celebration / reward | 30–80 KB | 1–3 s |
| Onboarding hero | 50–150 KB | 3–6 s |

Techniques:
- Delete hidden AE layers before export
- Replace raster images with vectors
- Reduce keyframe density
- Lower comp resolution to display size
- Convert JSON → dotlottie (often 50–80% smaller)

## TMA screen lifecycle pattern

```javascript
const screens = {
  start: { mount: () => mountLottie(startEl, '/assets/lottie/logo.lottie'), destroy: destroyLottie },
  finish: { mount: () => mountLottie(finishEl, '/assets/lottie/win.lottie', { loop: false }), destroy: destroyLottie },
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, { destroy }]) => {
    if (key !== name) destroy?.()
  })
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById(`screen-${name}`)?.classList.add('active')
  screens[name]?.mount?.()
}
```

## Static fallback for reduced motion

```javascript
function mountWithFallback(container, lottieSrc, posterSrc) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const img = document.createElement('img')
    img.src = posterSrc
    img.alt = ''
    img.className = 'lottie-poster'
    container.replaceChildren(img)
    return null
  }
  return mountLottie(container, lottieSrc)
}
```

Export poster: last frame PNG from LottieFiles preview or AE.

## Intersection Observer (pause off-screen)

```javascript
function observeVisibility(animation, el) {
  const observer = new IntersectionObserver(([entry]) => {
    if (!animation) return
    entry.isIntersecting ? animation.play() : animation.pause()
  }, { threshold: 0.1 })
  observer.observe(el)
  return () => observer.disconnect()
}
```

## Unsupported AE features (avoid at design time)

- Most layer effects (drop shadow OK in some exports; gaussian blur often breaks)
- Expressions (use baked keyframes)
- 3D layers
- Masks with heavy complexity
- Merge paths on old players (test target runtime)

## Version pinning

Pin major versions in production TMA builds. Test animation after any `lottie-web` or `dotlottie-web` upgrade — renderer differences can shift layout by 1–2 px.

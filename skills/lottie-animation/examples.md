# Lottie Examples

## Loader on app start (vanilla TMA)

```javascript
import { DotLottie } from '@lottiefiles/dotlottie-web'

const loaderEl = document.getElementById('app-loader')
let loaderAnim = null

function showLoader() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  loaderAnim = new DotLottie({
    canvas: document.createElement('canvas'),
    src: 'assets/lottie/loader.lottie',
    loop: true,
    autoplay: true,
  })
  loaderEl.replaceChildren(loaderAnim.canvas)
  loaderEl.hidden = false
}

function hideLoader() {
  loaderAnim?.destroy()
  loaderAnim = null
  loaderEl.hidden = true
  loaderEl.replaceChildren()
}
```

## One-shot celebration with haptic (vanilla TMA)

```javascript
function playWinAnimation(container) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const anim = lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: 'assets/lottie/confetti.json',
  })

  window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')

  anim.addEventListener('complete', () => {
    anim.destroy()
    container.replaceChildren()
  })
}
```

## React: conditional celebration

```tsx
import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import confetti from '@/assets/lottie/confetti.json'

interface WinBurstProps {
  show: boolean
}

export function WinBurst({ show }: WinBurstProps) {
  const [visible, setVisible] = useState(false)
  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (show && !reducedMotion) setVisible(true)
  }, [show, reducedMotion])

  if (!visible || reducedMotion) return null

  return (
    <div className="lottie-host" aria-hidden>
      <Lottie
        animationData={confetti}
        loop={false}
        onComplete={() => setVisible(false)}
      />
    </div>
  )
}
```

## React: lazy-loaded onboarding

```tsx
import { Suspense, lazy } from 'react'

const Lottie = lazy(() => import('lottie-react'))

export function OnboardingHero({ data }: { data: object }) {
  return (
    <Suspense fallback={<div className="lottie-host lottie-skeleton" />}>
      <Lottie animationData={data} loop className="lottie-host" aria-hidden />
    </Suspense>
  )
}
```

## Replace CSS celebration with Lottie (migration)

Before (CSS particles):
```html
<div class="celebration-confetti" id="celebration-confetti" aria-hidden="true"></div>
```

After:
```html
<div class="lottie-host" id="celebration-lottie" aria-hidden="true"></div>
```

```javascript
function onGameWin() {
  const el = document.getElementById('celebration-lottie')
  playWinAnimation(el)
}
```

Remove unused CSS keyframes after verifying Lottie covers the same moment.

## Button icon micro-interaction

```javascript
const btn = document.getElementById('btn-like')
let iconAnim = null

btn.addEventListener('click', () => {
  if (!iconAnim) {
    iconAnim = lottie.loadAnimation({
      container: btn.querySelector('.icon-slot'),
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: 'assets/lottie/heart.json',
    })
  }
  iconAnim.goToAndPlay(0, true)
})
```

## Preload critical animation

```html
<link rel="preload" href="assets/lottie/loader.lottie" as="fetch" crossorigin>
```

For JSON:
```html
<link rel="preload" href="assets/lottie/loader.json" as="fetch" crossorigin>
```

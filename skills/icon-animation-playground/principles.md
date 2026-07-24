# Animation principles (playground icons)

Condensed from AAIWorkshop `animation-principles.md`. Apply when creating or tuning icons that appear in the playground.

## 1. Split into animated parts

Treat an icon as layers, not one SVG blob.

| Part | Role | Typical animation |
|------|------|-------------------|
| Background / body | Main shape | Opacity, scale, rotate |
| Foreground / accent | Arrow, ring, center | Translate, scale |

Separate paths in markup before writing keyframes — even when fills match.

## 2. Keyframe phases

Describe states at time percentages (`0` / mid / `100`), not vague ideas. Name states before implementing.

## 3. Shared delay

Related parts that should feel like one gesture share `--anim-delay` (or `common.delay`).

## 4. No discontinuous jumps

End of phase N must equal start of phase N+1, or use a single timeline. The browser does not interpolate between two separate animations.

## 5. Isolate from layout

Fixed-size wrapper, overflow/clip, stable `transform-origin` (e.g. viewBox center `12px 12px`). Animation must not resize surrounding layout.

## 6. Triggers are API

`load` | `hover` | `click` | `focus` | `manual` (`play()`). Separate *what* animates from *when*.

## 7. Explicit hit targets

Host needs width/height; attach pointer events to the inner stage; `cursor: pointer` for interactive triggers.

## 8. Intentional idle

Define resting styles before `is-playing` so the icon does not flash wrong frames.

## 9. Register icons

Artwork in definitions; named motions in motion registry; player only plays. Prefer reuse; unique gestures get a new motion name.

## 10. Prefer transform + opacity

Avoid animating `width`, `height`, `top`, `left`, `margin`. Animate fill/stroke only when color is part of the gesture.

## 11. Exaggerate assembly gaps

When parts join, start with a readable spatial gap at 24×24, then close it.

## 12. Phase % from durations

```
exit% = moveDuration / (moveDuration + settleDuration) × 100
```

Timeline and CSS must share this formula when timing is editable.

## Ship checklist

- [ ] Parts split
- [ ] Motion chosen or named
- [ ] Keyframe phases written
- [ ] Shared delay + durations as variables
- [ ] Move/settle % derived from durations
- [ ] Assembly gap exaggerated if needed
- [ ] No phase jumps
- [ ] Fixed stage + clip
- [ ] Idle + final states
- [ ] Trigger + replay works
- [ ] Hit area OK
- [ ] Parent layout stable during playback

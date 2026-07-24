# create-animation-guide — reference

## Why this skill exists

The icon playground’s `principles.md` was not written from scratch as theory. It was **mined** from AAIWorkshop’s full `animation-principles.md` (itself mined from building the phone-icon system), then **condensed** for agents.

This skill generalizes that pipeline for any motion domain.

## Pipeline diagram

```text
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ Code + bugs │ →  │ Lesson cards │ →  │ Clusters    │
│ + old docs  │    │ symptom/rule │    │ 8–14 topics │
└─────────────┘    └──────────────┘    └──────┬──────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
            Full animation-principles.md                    Condensed principles.md
            (humans / workshop)                             (skills / agents)
                     │                                                 │
                     └─────────────── Ship checklist ──────────────────┘
```

## Source priority

1. Failures fixed while implementing (highest signal)  
2. Motion/player/definition code  
3. Existing principles docs in-repo  
4. General animation knowledge (lowest — only to fill gaps)

## Full vs condensed length

| Edition | Rough size | Reader |
|---------|------------|--------|
| Full | 150–300+ lines | Humans learning the system |
| Condensed | 60–90 lines | Agents mid-task |

## Checklist of principle clusters (icon / CSS SVG)

Use as a prompt when clustering; delete unused rows:

- [ ] Layer split  
- [ ] Keyframe phases  
- [ ] Shared delay  
- [ ] Continuity / no jumps  
- [ ] Layout isolation  
- [ ] Triggers API + replay reflow  
- [ ] Hit targets  
- [ ] Idle vs playing  
- [ ] Definitions / motions / player  
- [ ] Transform + opacity (fill when intentional)  
- [ ] Assembly gap exaggeration  
- [ ] Phase % from durations  
- [ ] Scoped keyframes (multi-instance)  

## Related skills

- `icon-animation-playground` — consumes condensed `principles.md`  
- Domain motion skills should link their guide under “Animation rules”

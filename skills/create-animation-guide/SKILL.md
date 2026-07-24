---
name: create-animation-guide
description: >-
  Creates an animation principles / guide markdown by mining a codebase or
  workshop notes, then condensing lessons into numbered rules, formulas, and a
  ship checklist. Use when the user says create animation guide, animation
  principles, animation-principles.md, condense animation lessons, or wants a
  principles.md for icons/UI motion.
---

# Create animation guide

Produce a durable **animation principles** markdown from real implementation experience — the same algorithm used to turn AAIWorkshop’s long workshop notes into the condensed `principles.md` for the icon playground skill.

## Goal

Write a guide that agents and engineers can follow while **building or tuning** motion — not a marketing essay.

Default output name: `animation-principles.md` (project) or `principles.md` (inside a skill).

## Algorithm (do this in order)

```
Task Progress:
- [ ] 1. Scope — audience, domain, output path
- [ ] 2. Mine sources — code + notes + failures
- [ ] 3. Extract lessons — symptom → cause → rule
- [ ] 4. Cluster into numbered principles
- [ ] 5. Write full guide (Rule / Why / How)
- [ ] 6. Condense agent edition (optional but preferred for skills)
- [ ] 7. Add ship checklist + cite sources
- [ ] 8. Place file(s) and link from related skills/docs
```

### 1. Scope

Ask only if missing:

| Question | Defaults |
|----------|----------|
| Domain | Infer from repo (SVG icons, UI transitions, Lottie, etc.) |
| Audience | Engineers + coding agents |
| Depth | Full workshop guide **and** condensed agent edition |
| Path | Project root / `docs/` / skill folder |

### 2. Mine sources

Collect evidence in parallel:

1. **Existing prose** — `*animation*princip*`, `*motion*guide*`, workshop READMEs  
2. **Motion code** — keyframes, motion registries, players, CSS vars (`--anim-delay`, `--move-duration`)  
3. **Definitions split** — icon/component data vs named motions vs player  
4. **Bugs fixed in chat/commits** — layout shift, jump cuts, wrong global `@keyframes`, missing idle, bad hit targets  
5. **Timing formulas** — anything derived (`exit% = move / (move+settle)`)

Prefer **project-specific** lessons over generic animation theory.

### 3. Extract lessons

For each finding, fill:

```
Symptom:  what broke or felt wrong
Cause:    why
Rule:     imperative one-liner
How:      concrete fix (CSS/API/structure)
```

Discard advice that is not backed by code or a real failure.

### 4. Cluster into principles

Group into **8–14** numbered principles. Typical clusters for icon/UI motion:

1. Split into layers / parts  
2. Keyframe phases (named states at %)  
3. Shared delay / coordinated timing  
4. No discontinuous jumps  
5. Isolate from layout  
6. Triggers as API  
7. Hit targets  
8. Intentional idle  
9. Register / reuse named motions  
10. Prefer transform + opacity  
11. Exaggerate assembly gaps (if join/assemble motions exist)  
12. Derive phase % from editable durations  
13. Scope CSS keyframes when many players share a page *(add if gallery/playground)*  

Rename/merge to fit the domain; do not force irrelevant clusters.

### 5. Write the full guide

Use this shape per principle (same as AAIWorkshop source style):

```markdown
## N. Short title

1–2 sentences of context.

**Why:** …

**Rule:** …

**How / Fixes:** bullets or small code block
```

Include:

- Short intro: “Lessons from building …”
- Tables where they clarify (parts, triggers)
- At least one **worked formula** if timing is editable
- Horizontal rules between principles only if the full workshop edition is long

### 6. Condense the agent edition

When the guide will live in a **Cursor skill** or be agent-facing, also produce a short `principles.md`:

| Keep | Cut |
|------|-----|
| Numbered rule titles | Long narrative “why” essays |
| One-line rule + tiny example | Duplicate explanations |
| Formulas as code fences | Project gossip / dates |
| Ship checklist | Marketing tone |

Target: **~60–90 lines**, scannable in under a minute.

Template: [template.md](template.md).

### 7. Ship checklist

End **both** editions with checkboxes that map 1:1 to principles, e.g.:

```markdown
## Ship checklist
- [ ] Parts split
- [ ] Keyframe phases named
- [ ] Shared delay / vars
- [ ] No phase jumps
- [ ] Fixed stage + clip
- [ ] Idle + playing states
- [ ] Trigger + replay
- [ ] Hit area OK
- [ ] Layout stable
- [ ] Phase % from durations (if applicable)
- [ ] Keyframes scoped (if multi-player page)
```

### 8. Place and link

| Context | Put guide at |
|---------|----------------|
| Project docs | `animation-principles.md` or `docs/animation-principles.md` |
| Icon playground skill | `principles.md` next to `SKILL.md`; link under “Animation rules” |
| General motion skill | `principles.md` or `animation-guide.md` |

Cite the source path in the intro: `Condensed from …` or `Lessons from …`.

## Output modes

| Mode | When | Deliverable |
|------|------|-------------|
| **Full** | Human workshop / repo docs | Long `animation-principles.md` |
| **Condensed** | Skill / agent | Short `principles.md` |
| **Both** | Default when building a skill from a workshop | Full in project + condensed in skill |

## Quality bar

- Every principle has an imperative **Rule**
- No principle without evidence from this codebase/domain
- Prefer `transform` / `opacity` guidance unless color is intentional
- Call out **layout isolation** and **idle states** if CSS/SVG motion exists
- If multiple animated instances share a page, include **scoped `@keyframes`**
- Checklist present and actionable

## Do not

- Invent universal Disney-style principles disconnected from the repo
- Dump raw keyframes without rules
- Write only “make it smooth” advice
- Overwrite a richer existing guide without merging lessons

## Example (canonical)

Source full guide: `~/Documents/http/AAIWorkshop/animation-principles.md`  
Condensed skill edition: `~/.cursor/skills/icon-animation-playground/principles.md`

That condensation is the reference run of this algorithm.

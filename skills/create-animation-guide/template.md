# Condensed animation principles — template

Use for skill `principles.md` or any agent-facing edition.

```markdown
# Animation principles (<domain>)

Condensed from <source path or “lessons from building …”>. Apply when creating or tuning <domain> motion.

## 1. <Title>

<One imperative paragraph or short table.>

## 2. <Title>

…

## N. <Title>

<Formula fence if needed>

## Ship checklist

- [ ] …
- [ ] …
```

## Condensation rules

1. **One idea per heading** — title = the rule’s noun phrase  
2. **Lead with the rule** — cut story; keep “do X / don’t Y”  
3. **Keep domain nouns** — `bg` / `arrow-group`, `is-playing`, `--anim-delay`  
4. **Keep formulas** — editable timing must stay copy-pasteable  
5. **Drop** — repeated why paragraphs, changelog tone, one-off bug IDs  
6. **End with checklist** — same order as principles  

## Mapping: full → condensed

| Full section pattern | Condensed form |
|----------------------|----------------|
| Title + why + rule + fixes | Title + 2–4 lines + optional mini table/code |
| Long trigger table | One line listing triggers + “separate what / when” |
| Multi-fix jump explanation | “End N = start N+1, or one timeline” |
| Architecture essay | “Definitions / motions / player; prefer reuse” |

## Extraction worksheet (fill while mining)

```text
ID:
Symptom:
Evidence (file:line or note):
Cause:
Rule:
How:
Cluster → principle #:
Keep in condensed? (y/n):
```

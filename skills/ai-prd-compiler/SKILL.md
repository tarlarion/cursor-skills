---
name: ai-prd-compiler
description: >-
  Compiles feature briefs into AIPRD v2 code-ready product specs. Use when the
  user says compile feature, recompile, AI-PRD, AIPRD, product spec, or works
  with feature.md and airdp-schema.md. Asks blocking decisions via AskQuestion
  with contextual option labels before generating the full PRD.
---
# AI-PRD Compiler (AIPRD v2)

Product Compiler skill. Output is **code-ready spec only** — no wireframes, no Figma thinking. UI = component trees.

## Pipeline

1. Read `feature.md` (or user brief) and `airdp-schema.md` if present.
2. **Decision pass** — find ambiguities that change scenarios, logic, API, or permissions (see below).
3. If blocking decisions exist and are **not** already answered in feature/chat → **AskQuestion** (one batch, max 3 questions).
4. After answers (or if none needed) → compile full AIPRD v2.
5. Write to `{slug}-aiprd.md` when user asks to save; otherwise output in chat.

## Required output sections

1. SCENARIOS (primary / edge / recovery)
2. DECISIONS (question + chosen option + rationale)
3. PRODUCT LOGIC (rules, states, entities)
4. UI COMPONENT TREE (screens as component trees; props / state / events per component)
5. API CONTRACT
6. ANALYTICS EVENTS
7. EDGE CASES

Optional: DIAGRAMS (mermaid) when user asks.

## Decision pass — when to ask

Ask **only** if the answer changes product behavior. Skip if `feature.md` or prior chat already decides.

Typical triggers:

- Auth scope (guest vs registered)
- Moderation / status transitions (can resubmit? who can edit published?)
- MVP vs v2 scope
- Payment / compliance / negative scenarios on/off
- Single vs multiple entities, limits, defaults
- External vs hosted assets
- Terminology locked to one UX path

Do **not** ask:

- Styling preferences unless they affect components
- Things inferable from domain norms with a noted assumption in DECISIONS
- More than 3 questions at once — prioritize highest impact

## Decision UI — AskQuestion (preferred)

Use the **AskQuestion** tool. Each item = one decision form:

```
Вопрос N. <полный вопрос одним предложением>
[Кнопка: контекстный ответ 1]
[Кнопка: контекстный ответ 2]
[Кнопка: контекстный ответ 3]
```

### Rules for option labels (buttons)

| Rule | Good | Bad |
|------|------|-----|
| Self-contained | «Каталог и поиск без регистрации; auth только для избранного и публикации» | «Да» |
| States outcome | «Отклонённый skill — терминально, без переотправки» | «Нет» |
| 8–90 characters | «Emoji-лайки доступны гостям; избранное — после входа» | «Вариант B» |
| Mutually exclusive | 2–4 options per question | 5+ options |
| Recommended first | Put sensible default first with `(Recommended)` in label when feature is silent | Random order |

### AskQuestion JSON shape

```json
{
  "title": "Решения для AI-PRD",
  "questions": [
    {
      "id": "guest_access",
      "prompt": "Вопрос 1. Что доступно гостю без регистрации?",
      "options": [
        {
          "id": "catalog_only",
          "label": "Только просмотр каталога, поиск и скачивание (Recommended)"
        },
        {
          "id": "catalog_no_download",
          "label": "Каталог и поиск; скачивание только после входа"
        },
        {
          "id": "login_wall",
          "label": "Весь каталог только после регистрации"
        }
      ]
    }
  ]
}
```

- `id` — snake_case, stable for DECISIONS table.
- One question per decision; number in `prompt`: `Вопрос 1.`, `Вопрос 2.`
- Add `"allow_multiple": true` only for non-exclusive tags/categories.
- **Wait for user answers before compiling** unless user said «без вопросов» / «assume defaults».

## Decision UI — markdown fallback

If AskQuestion is unavailable, use this exact visual pattern:

```markdown
**Вопрос 1.** Что доступно гостю без регистрации?

1. **Каталог, поиск и скачивание** — регистрация только для избранного и публикации *(рекомендуется)*
2. **Каталог и поиск** — скачивание после входа
3. **Весь каталог** — только после регистрации

Ответьте номером или своим вариантом.
```

Never use bare «Да / Нет» as the only distinction between options.

## Recording answers in DECISIONS

After user chooses, each row:

| ID | Question | Options considered | Chosen | Why |
|----|----------|-------------------|--------|-----|
| D1 | … | кратко | **выбранное** | связь с feature или ответом пользователя |

Chosen option text must match the button label semantics.

## UI rules (from AIPRD v2)

- No wireframes. Every screen = component tree.
- Every component: props, state, events; loading / empty / error where relevant.
- Locale: match feature language; apply locale-ru / locale-en rules from project.

## File conventions

| File | Role |
|------|------|
| `feature.md` | Input brief |
| `airdp-schema.md` | Schema template + decision protocol |
| `{slug}-aiprd.md` | Compiled output |

`slug` = kebab-case from product name (e.g. `productskills-aiprd.md`).

## Anti-patterns

- Compiling full PRD while 2+ blocking decisions are open.
- Asking «Подтверждаете?» with Yes/No.
- Dumping 10 questions in chat as prose bullets instead of AskQuestion.
- Inventing decisions user already stated in feature.md.
- Skipping DECISIONS section when assumptions were made — mark as «assumed» with rationale.

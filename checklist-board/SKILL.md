---
name: checklist-board
description: >-
  Manages checklist.md, CHANGELOG.md [Unreleased], and interactive kanban canvas.
  Use when the user says checklist-board, checklist, борда, доска задач, перемести
  задачу, применить в checklist, обнови доску, статус задач, or when finishing a
  user-facing feature in a repo with checklist.md.
---

# Checklist board

## When to load

- `/checklist-board` or user names this skill
- Task status changes, board view, changelog sync
- User clicked **«Применить в checklist»** on canvas (newComposerChat with board state)
- User-facing feature completed in chat

## Source of truth

| File | Role |
|------|------|
| `checklist.md` | Persistent tasks (git) — **главный источник** |
| `CHANGELOG.md` | `[Unreleased]` on Done for user-facing work |
| `canvases/checklist-board.canvas.tsx` | `BOARD` — дефолт борды |
| `canvases/checklist-board.canvas.data.json` | Черновик UI (перетаскивания); **не в git** |

Canvas path: `~/.cursor/projects/<workspace-slug>/canvases/checklist-board.canvas.tsx`

## Sync protocol (обязательно)

Синхронизация **checklist.md → canvas** (`BOARD` + `canvas.data.json`). Черновик на борде без Apply в git не пишется.

### Как синхронизировать

| Кто меняет checklist | Как |
|----------------------|-----|
| **Агент в чате** | В том же turn: `npm run checklist:sync` (или правка BOARD вручную) |
| **Ручной save в редакторе** | Фоновый watcher (см. ниже) |
| **Агент Write tool** | Cursor hook `afterFileEdit` → sync script |

### checklist.md → canvas (агент)

**Когда:** добавил/перенёс/закрыл задачу, CHANGELOG после Done, «обнови доску».

1. Обнови `checklist.md`
2. Запусти **`npm run checklist:sync`** — скрипт парсит checklist, сохраняет stable `id`, пишет `BOARD` + сбрасывает `canvas.data.json`

Не жди «обнови доску».

### Фоновый sync в проекте (рекомендуется)

Скопируй из скилла `scripts/` и `hooks/` в `.cursor/` проекта (см. [Project setup](#project-setup)). Тогда:

- **`sessionStart`** — поднимает watcher на `checklist.md` (ручные правки в редакторе)
- **`afterFileEdit`** — sync после Write/TabWrite агента

Ручной запуск: `npm run checklist:watch` (если hooks не включены).

### canvas → checklist.md (только по явному действию)

**Когда:** пользователь нажал **«Применить в checklist»** (или вставил раскладку из борды в чат).

**Не делай:** не пиши в `checklist.md` из одних только перетаскиваний на борде без Apply — это черновик.

**После Apply:** обнови `checklist.md` + CHANGELOG для новых Done → затем sync canvas из checklist (шаги выше), чтобы `BOARD` и data.json совпали.

### Порядок приоритета

| Конфликт | Побеждает |
|----------|-----------|
| Apply с борды vs старый checklist | Содержимое Apply → checklist.md |
| Агент правит checklist vs черновик на борде | checklist.md → перезаписать data.json |

## Checklist format

| Section | id |
|---------|-----|
| `## In progress` | `in_progress` |
| `## Backlog` | `backlog` |
| `## Done` | `done` |
| `## Cancelled` | `cancelled` |

```markdown
- [ ] **Title** — note
- [x] **Title** — done
```

Parse: `- \[[ x]\] \*\*(.+?)\*\*(?: — (.+))?`

## Canvas (interactive)

Board supports **draft edits** via `useCanvasState` — not written to `checklist.md` until applied.

### User actions on canvas

| Action | Behaviour |
|--------|-----------|
| Click card | Select task → detail panel with full title + note |
| `→ Column` pill on card | Move task to that status (local state) |
| Detail panel pills | Same moves, full text visible |
| **Применить в checklist** | Opens agent chat with full board markdown — **you must update checklist.md** |
| **Сбросить** | Revert to `BOARD` constant from canvas file |

### Canvas UI rules (when editing canvas file)

- **Never truncate** task title or note — use `whiteSpace: "normal"`, `wordBreak: "break-word"`
- Move pills for every column except current: `→ Backlog`, `→ In progress`, etc.
- Selected card: accent border + `TaskDetailPanel` below grid
- Persist columns + `selectedTaskId` in `useCanvasState`

### Refresh canvas from checklist.md

Предпочитай **`npm run checklist:sync`** (скрипт `.cursor/scripts/sync-checklist-board.mjs`). Иначе вручную: parse → `BOARD` → `canvas.data.json` → `updatedAt`.

User **Сбросить** — только если после sync снова двигали карточки на борде и хотят откатить черновик.

## Project setup

Один раз в репозитории с `checklist.md` и canvas `checklist-board.canvas.tsx`:

```bash
mkdir -p .cursor/scripts .cursor/hooks
cp checklist-board/scripts/*.mjs .cursor/scripts/
cp checklist-board/hooks/* .cursor/hooks/
cp checklist-board/hooks/hooks.json.example .cursor/hooks.json
chmod +x .cursor/hooks/start-checklist-board-watch.sh
```

В `package.json`:

```json
"checklist:sync": "node .cursor/scripts/sync-checklist-board.mjs",
"checklist:watch": "node .cursor/scripts/sync-checklist-board-watch.mjs"
```

В `.gitignore`: `.cursor/.checklist-board-watch.pid`, `.cursor/checklist-board-watch.log`

Перезапусти Cursor (или сохрани `hooks.json`) — watcher стартует на `sessionStart`.

Override canvas path: env `CHECKLIST_BOARD_CANVAS_DIR`.

## Agent workflows

### Add task (chat)

1. Read `checklist.md` → append to **Backlog**
2. Sync canvas: `npm run checklist:sync`
3. Confirm briefly

### Move task (chat)

User: «перенеси X в done» / «в работу»

1. Find task (fuzzy title match)
2. Move line to section; `[x]` only in **Done**
3. If user-facing Done → `CHANGELOG.md` `[Unreleased]`
4. Sync canvas: `npm run checklist:sync`

### Apply from canvas (chat)

User message contains «Примени раскладку задач с canvas» + markdown sections.

1. Replace checklist sections with provided content (preserve file header/footer)
2. Map sections: In progress, Backlog, Done, Cancelled
3. For new Done items vs previous checklist → add CHANGELOG bullets if user-facing
4. Refresh `BOARD` constant to match
5. Sync `canvas.data.json` from checklist
6. Confirm what moved
7. **Start work** on every task that is newly in **In progress** (see below) — do not wait for a separate «начни делать»

### In progress = start immediately

**Agreement:** if the user moves a task to **In progress** — on the canvas (`checklist-board.canvas.tsx`), in `checklist.md`, or via chat («в работу») — treat it as assigned to you and **begin implementation in the same turn**. Do not ask «начать?» or wait for confirmation.

| Trigger | What you do |
|---------|-------------|
| Canvas → **→ In progress** → **Применить в checklist** | Apply board to `checklist.md`, then implement all tasks in **In progress** |
| Edit `checklist.md` → task in **In progress** | Read task title + note, implement |
| Chat: «перенеси X в in progress» / «в работу» | Move in checklist, sync canvas, then implement |
| `/checklist-board` and **In progress** is non-empty | Pick up those tasks (oldest / only one first if several) |

After finishing: move to **Done**, add **CHANGELOG** if user-facing, `npm run checklist:sync`.

### Show board (chat only)

Compact markdown by section with counts — or tell user to open **Checklist board** canvas tab.

## Examples

| User says | Action |
|-----------|--------|
| «Добавь задачу: …» | Backlog + sync canvas |
| «Покажи доску» | Open canvas tab hint |
| «Перенеси X в backlog» | checklist + CHANGELOG? + sync canvas |
| Canvas «Применить в checklist» | Apply pasted board state to checklist.md |

## Do not

- Invent tasks
- Truncate text on canvas cards
- Mark done without user intent
- Bump version unless asked

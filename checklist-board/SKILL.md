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
| `checklist.md` | Persistent tasks (git) |
| `CHANGELOG.md` | `[Unreleased]` on Done for user-facing work |
| `canvases/checklist-board.canvas.tsx` | Visual board + draft moves |

Canvas path: `~/.cursor/projects/<workspace-slug>/canvases/checklist-board.canvas.tsx`

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

1. Read [canvas skill](~/.cursor/skills-cursor/canvas/SKILL.md)
2. Parse `checklist.md` → rewrite `BOARD` constant only (not user's draft in `.canvas.data.json`)
3. Set `updatedAt` to today
4. User may need **Сбросить** to see synced data if they had local drafts

## Agent workflows

### Add task (chat)

1. Read `checklist.md` → append to **Backlog**
2. Refresh `BOARD` in canvas file
3. Confirm briefly

### Move task (chat)

User: «перенеси X в done» / «в работу»

1. Find task (fuzzy title match)
2. Move line to section; `[x]` only in **Done**
3. If user-facing Done → `CHANGELOG.md` `[Unreleased]`
4. Refresh `BOARD` in canvas

### Apply from canvas (chat)

User message contains «Примени раскладку задач с canvas» + markdown sections.

1. Replace checklist sections with provided content (preserve file header/footer)
2. Map sections: In progress, Backlog, Done, Cancelled
3. For new Done items vs previous checklist → add CHANGELOG bullets if user-facing
4. Refresh `BOARD` constant to match
5. Confirm what moved
6. **Start work** on every task that is newly in **In progress** (see below) — do not wait for a separate «начни делать»

### In progress = start immediately

**Agreement:** if the user moves a task to **In progress** — on the canvas (`checklist-board.canvas.tsx`), in `checklist.md`, or via chat («в работу») — treat it as assigned to you and **begin implementation in the same turn**. Do not ask «начать?» or wait for confirmation.

| Trigger | What you do |
|---------|-------------|
| Canvas → **→ In progress** → **Применить в checklist** | Apply board to `checklist.md`, then implement all tasks in **In progress** |
| Edit `checklist.md` → task in **In progress** | Read task title + note, implement |
| Chat: «перенеси X в in progress» / «в работу» | Move in checklist, refresh BOARD, then implement |
| `/checklist-board` and **In progress** is non-empty | Pick up those tasks (oldest / only one first if several) |

After finishing: move to **Done**, add **CHANGELOG** if user-facing, refresh `BOARD`.

### Show board (chat only)

Compact markdown by section with counts — or tell user to open **Checklist board** canvas tab.

## Examples

| User says | Action |
|-----------|--------|
| «Добавь задачу: …» | Backlog + refresh BOARD |
| «Покажи доску» | Open canvas tab hint |
| «Перенеси X в backlog» | checklist + CHANGELOG? + BOARD |
| Canvas «Применить в checklist» | Apply pasted board state to checklist.md |

## Do not

- Invent tasks
- Truncate text on canvas cards
- Mark done without user intent
- Bump version unless asked

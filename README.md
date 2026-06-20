# cursor-skills

Публичная коллекция [Cursor Agent Skills](https://cursor.com/docs/agent/skills) — инструкции для агента под конкретные workflow.

## Структура

Каждый скилл — папка с `SKILL.md` и опциональными скриптами:

```
cursor-skills/
├── checklist-board/
│   ├── SKILL.md
│   ├── scripts/          # sync checklist.md → canvas
│   └── hooks/            # Cursor hooks (пример)
└── …
```

## Установка

### Личный скилл (все проекты)

```bash
git clone https://github.com/tarlarion/cursor-skills.git ~/.cursor/skills-src
ln -sf ~/.cursor/skills-src/checklist-board ~/.cursor/skills/checklist-board
```

Или скопируйте папку:

```bash
cp -R checklist-board ~/.cursor/skills/checklist-board
```

### Скилл в репозитории проекта

```bash
mkdir -p .cursor/skills
cp -R checklist-board .cursor/skills/checklist-board
```

Для проекта можно добавить короткий оверлей в `.cursor/skills/checklist-board/SKILL.md` с путями к `checklist.md`, canvas и rule — см. [calendar](https://github.com/tarlarion/calendar) как пример.

### Фоновый sync checklist → canvas (checklist-board)

В проекте с `checklist.md` и canvas `checklist-board.canvas.tsx`:

```bash
mkdir -p .cursor/scripts .cursor/hooks
cp checklist-board/scripts/*.mjs .cursor/scripts/
cp checklist-board/hooks/* .cursor/hooks/
cp checklist-board/hooks/hooks.json.example .cursor/hooks.json
chmod +x .cursor/hooks/start-checklist-board-watch.sh
```

Добавьте в `package.json`:

```json
"checklist:sync": "node .cursor/scripts/sync-checklist-board.mjs",
"checklist:watch": "node .cursor/scripts/sync-checklist-board-watch.mjs"
```

Перезапустите Cursor — watcher на `checklist.md` стартует при открытии проекта.

## Скиллы

| Скилл | Описание |
|-------|----------|
| [checklist-board](./checklist-board/) | Kanban-доска, `checklist.md`, CHANGELOG, canvas, фоновый sync |

## Лицензия

MIT — см. [LICENSE](./LICENSE).

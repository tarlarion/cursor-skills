# cursor-skills

Публичная коллекция [Cursor Agent Skills](https://cursor.com/docs/agent/skills) — инструкции для агента под конкретные workflow.

## Структура

Каждый скилл — отдельная папка с `SKILL.md`:

```
cursor-skills/
├── checklist-board/
│   └── SKILL.md
└── …
```

## Установка

### Личный скилл (все проекты)

```bash
git clone https://github.com/tarlarion/cursor-skills.git ~/.cursor/skills-src
ln -s ~/.cursor/skills-src/checklist-board ~/.cursor/skills/checklist-board
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

## Скиллы

| Скилл | Описание |
|-------|----------|
| [checklist-board](./checklist-board/) | Kanban-доска, `checklist.md`, CHANGELOG, canvas «Применить в checklist» |

## Лицензия

MIT — см. [LICENSE](./LICENSE).

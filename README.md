# cursor-skills

Публичная коллекция [Cursor Agent Skills](https://cursor.com/docs/agent/skills) и Cursor Rules — инструкции для агента под конкретные workflow.

## Структура

```
cursor-skills/
├── skills/                    # Личные agent skills
│   ├── lottie-animation/
│   └── text-to-lottie/
├── checklist-board/           # Skill + scripts + hooks
├── rules/
│   ├── user/                  # User rules (глобальные)
│   └── projects/              # Project rules по репозиториям
│       ├── seller-landing/
│       ├── calendar/
│       └── jago/
└── README.md
```

## Установка skills

### Личный скилл (все проекты)

```bash
git clone https://github.com/tarlarion/cursor-skills.git ~/.cursor/skills-src
ln -sf ~/.cursor/skills-src/checklist-board ~/.cursor/skills/checklist-board
ln -sf ~/.cursor/skills-src/skills/lottie-animation ~/.cursor/skills/lottie-animation
ln -sf ~/.cursor/skills-src/skills/text-to-lottie ~/.cursor/skills/text-to-lottie
```

### Скилл в репозитории проекта

```bash
mkdir -p .cursor/skills
cp -R checklist-board .cursor/skills/checklist-board
```

## Установка rules

### User rules (глобально)

Скопируйте нужные `.mdc` из `rules/user/` в **Cursor Settings → Rules**.

Или подключите как project rules в конкретном репозитории:

```bash
mkdir -p .cursor/rules
cp rules/user/locale-ru.mdc .cursor/rules/
cp rules/user/global-locale-selection.mdc .cursor/rules/
```

### Project rules

Примеры из реальных проектов лежат в `rules/projects/<project>/`. Скопируйте в `.cursor/rules/` целевого репозитория.

## Скиллы

| Скилл | Описание |
|-------|----------|
| [checklist-board](./checklist-board/) | Kanban-доска, `checklist.md`, CHANGELOG, canvas, фоновый sync |
| [lottie-animation](./skills/lottie-animation/) | Генерация Lottie JSON анимаций |
| [text-to-lottie](./skills/text-to-lottie/) | Текст → Lottie (Bodymovin) |

## Rules

| Набор | Описание |
|-------|----------|
| [rules/user](./rules/user/) | Локализация (ru, en, de, fr, es, pt), выбор локали |
| [rules/projects/seller-landing](./rules/projects/seller-landing/) | Next.js, Shadcn, Toss-style design, layout |
| [rules/projects/calendar](./rules/projects/calendar/) | checklist-board rule |
| [rules/projects/jago](./rules/projects/jago/) | checklist-board rule |

## Фоновый sync checklist → canvas (checklist-board)

```bash
mkdir -p .cursor/scripts .cursor/hooks
cp checklist-board/scripts/*.mjs .cursor/scripts/
cp checklist-board/hooks/* .cursor/hooks/
cp checklist-board/hooks/hooks.json.example .cursor/hooks.json
chmod +x .cursor/hooks/start-checklist-board-watch.sh
```

## Лицензия

MIT — см. [LICENSE](./LICENSE).

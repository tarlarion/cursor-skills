#!/usr/bin/env node
/**
 * Sync checklist.md → checklist-board canvas (BOARD + canvas.data.json).
 * Usage: node .cursor/scripts/sync-checklist-board.mjs [--quiet]
 */
import fs from "fs"
import os from "os"
import path from "path"
import { fileURLToPath } from "url"

const QUIET = process.argv.includes("--quiet")

const SECTION_BY_HEADING = {
  "in progress": "in_progress",
  backlog: "backlog",
  done: "done",
  cancelled: "cancelled",
}

const STATUS_PREFIX = {
  in_progress: "wip",
  backlog: "backlog",
  done: "done",
  cancelled: "cancelled",
}

function log(...args) {
  if (!QUIET) console.log("[checklist-board sync]", ...args)
}

function resolveProjectRoot() {
  const here = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(here, "../..")
}

function resolveCanvasDir(projectRoot) {
  if (process.env.CHECKLIST_BOARD_CANVAS_DIR) {
    return process.env.CHECKLIST_BOARD_CANVAS_DIR.replace(/^~(?=$|[\\/])/, os.homedir())
  }

  const slug = projectRoot.replace(/^\/+/, "").replace(/\//g, "-")
  return path.join(os.homedir(), ".cursor", "projects", slug, "canvases")
}

function parseChecklist(content) {
  const tasks = []
  let currentStatus = null

  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("<!--")) continue

    const sectionMatch = trimmed.match(/^##\s+(.+)$/)
    if (sectionMatch) {
      currentStatus = SECTION_BY_HEADING[sectionMatch[1].trim().toLowerCase()] ?? null
      continue
    }

    const taskMatch = trimmed.match(/^- \[([ x])\] \*\*(.+?)\*\*(?: — (.+))?$/)
    if (!taskMatch || !currentStatus) continue

    tasks.push({
      title: taskMatch[2],
      note: taskMatch[3] ?? "",
      status: currentStatus,
      done: taskMatch[1] === "x",
    })
  }

  return tasks
}

function loadExistingIdsByTitle(canvasTsx) {
  const byTitle = new Map()
  const re = /id:\s*"([^"]+)"[\s\S]*?title:\s*"((?:\\.|[^"\\])*)"/g
  let match = re.exec(canvasTsx)

  while (match) {
    byTitle.set(match[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\"), match[1])
    match = re.exec(canvasTsx)
  }

  return byTitle
}

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/[`'"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "task"
}

function assignIds(tasks, existingByTitle) {
  const used = new Set(existingByTitle.values())

  return tasks.map((task) => {
    const existing = existingByTitle.get(task.title)
    if (existing) {
      return { ...task, id: existing }
    }

    const prefix = STATUS_PREFIX[task.status] ?? "task"
    let base = slugifyTitle(task.title)
    let id = `${prefix}-${base}`
    let suffix = 2

    while (used.has(id)) {
      id = `${prefix}-${base}-${suffix++}`
    }

    used.add(id)
    return { ...task, id }
  })
}

function escapeTsString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function formatBoardConstant(tasks, updatedAt) {
  const lines = tasks.map(
    (task) => `    {
      id: "${task.id}",
      title: "${escapeTsString(task.title)}",
      note: "${escapeTsString(task.note)}",
      status: "${task.status}",
      done: ${task.done},
    }`,
  )

  return `const BOARD: BoardSnapshot = {
  updatedAt: "${updatedAt}",
  tasks: [
${lines.join(",\n")}
  ],
}`
}

function replaceBoard(canvasTsx, boardConstant) {
  const start = canvasTsx.indexOf("const BOARD: BoardSnapshot = ")
  if (start === -1) throw new Error("BOARD constant not found in canvas file")

  const end = canvasTsx.indexOf("\n\nfunction cloneTasks", start)
  if (end === -1) throw new Error("BOARD block end not found in canvas file")

  return canvasTsx.slice(0, start) + boardConstant + canvasTsx.slice(end)
}

export function syncChecklistBoard(options = {}) {
  const projectRoot = options.projectRoot ?? resolveProjectRoot()
  const canvasDir = options.canvasDir ?? resolveCanvasDir(projectRoot)
  const checklistPath = path.join(projectRoot, "checklist.md")
  const canvasTsxPath = path.join(canvasDir, "checklist-board.canvas.tsx")
  const canvasDataPath = path.join(canvasDir, "checklist-board.canvas.data.json")

  if (!fs.existsSync(checklistPath)) {
    throw new Error(`checklist.md not found: ${checklistPath}`)
  }
  if (!fs.existsSync(canvasTsxPath)) {
    throw new Error(`canvas not found: ${canvasTsxPath}`)
  }

  const checklist = fs.readFileSync(checklistPath, "utf8")
  const canvasTsx = fs.readFileSync(canvasTsxPath, "utf8")
  const parsed = parseChecklist(checklist)
  const existingByTitle = loadExistingIdsByTitle(canvasTsx)
  const tasks = assignIds(parsed, existingByTitle)
  const updatedAt = new Date().toISOString().slice(0, 10)
  const boardConstant = formatBoardConstant(tasks, updatedAt)
  const nextCanvasTsx = replaceBoard(canvasTsx, boardConstant)

  fs.writeFileSync(canvasTsxPath, nextCanvasTsx)
  fs.writeFileSync(
    canvasDataPath,
    `${JSON.stringify({ tasks, selectedTaskId: null }, null, 2)}\n`,
  )

  log(`synced ${tasks.length} tasks → ${path.basename(canvasTsxPath)}`)
  return { tasks, updatedAt, canvasDir }
}

function isDirectRun() {
  const argvPath = process.argv[1]
  if (!argvPath) return false
  return path.resolve(argvPath) === fileURLToPath(import.meta.url)
}

if (isDirectRun()) {
  try {
    syncChecklistBoard()
  } catch (error) {
    console.error("[checklist-board sync]", error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

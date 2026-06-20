#!/usr/bin/env node
/**
 * Watch checklist.md and sync canvas on save (manual editor edits).
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { syncChecklistBoard } from "./sync-checklist-board.mjs"

const DEBOUNCE_MS = 300
const here = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(here, "../..")
const checklistPath = path.join(projectRoot, "checklist.md")
const pidPath = path.join(projectRoot, ".cursor", ".checklist-board-watch.pid")

let timer = null
let running = false

function writePid() {
  fs.mkdirSync(path.dirname(pidPath), { recursive: true })
  fs.writeFileSync(pidPath, `${process.pid}\n`)
}

function removePid() {
  try {
    fs.unlinkSync(pidPath)
  } catch {
    // ignore
  }
}

function scheduleSync(reason) {
  clearTimeout(timer)
  timer = setTimeout(() => {
    if (running) return
    running = true
    try {
      syncChecklistBoard({ projectRoot })
      console.log(`[checklist-board watch] synced (${reason})`)
    } catch (error) {
      console.error(
        "[checklist-board watch]",
        error instanceof Error ? error.message : error,
      )
    } finally {
      running = false
    }
  }, DEBOUNCE_MS)
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function ensureSingleInstance() {
  if (!fs.existsSync(pidPath)) return

  const pid = Number.parseInt(fs.readFileSync(pidPath, "utf8").trim(), 10)
  if (Number.isFinite(pid) && pid !== process.pid && isProcessAlive(pid)) {
    console.log(`[checklist-board watch] already running (pid ${pid})`)
    process.exit(0)
  }
}

function main() {
  if (!fs.existsSync(checklistPath)) {
    console.error(`[checklist-board watch] missing ${checklistPath}`)
    process.exit(1)
  }

  ensureSingleInstance()
  writePid()

  process.on("exit", removePid)
  process.on("SIGINT", () => process.exit(0))
  process.on("SIGTERM", () => process.exit(0))

  console.log(`[checklist-board watch] watching ${checklistPath}`)

  scheduleSync("initial")
  fs.watch(checklistPath, () => scheduleSync("save"))
}

main()

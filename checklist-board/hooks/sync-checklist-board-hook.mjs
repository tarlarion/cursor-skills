#!/usr/bin/env node
/**
 * Cursor afterFileEdit hook — sync canvas when checklist.md is edited by the agent.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { syncChecklistBoard } from "../scripts/sync-checklist-board.mjs"

async function readStdin() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString("utf8")
}

function checklistPathFromHook(input) {
  const candidates = [
    input.file_path,
    input.path,
    input.filePath,
    input.relative_path,
    input.relativePath,
  ].filter(Boolean)

  for (const candidate of candidates) {
    if (String(candidate).endsWith("checklist.md")) {
      return path.resolve(String(candidate))
    }
  }

  return null
}

async function main() {
  const raw = await readStdin()
  if (!raw.trim()) process.exit(0)

  let input
  try {
    input = JSON.parse(raw)
  } catch {
    process.exit(0)
  }

  if (!checklistPathFromHook(input)) process.exit(0)

  try {
    syncChecklistBoard({ projectRoot: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..") })
  } catch (error) {
    console.error(
      "[checklist-board hook]",
      error instanceof Error ? error.message : error,
    )
  }

  process.exit(0)
}

main()

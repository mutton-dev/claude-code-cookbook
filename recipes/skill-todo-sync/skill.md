---
name: todo-sync
description: Scan the codebase for TODO/FIXME/HACK/XXX comments and sync them into the Claude Code task list so nothing slips through cracks. Use when the user wants to triage technical debt or capture in-code notes as actionable tasks.
---

# TODO Sync

Scan source files for `TODO`, `FIXME`, `HACK`, and `XXX` comments and convert each one into a structured task via TaskCreate.

## Steps

1. Determine the scan root:
   - Default to the current working directory.
   - Skip `node_modules`, `dist`, `build`, `.git`, `.next`, `coverage`, `vendor`, and any directory listed in `.gitignore`.
2. Run a grep pass:
   - Use `git grep -nE '(TODO|FIXME|HACK|XXX)[:( ]'` when inside a git repo for speed and `.gitignore` awareness.
   - Otherwise fall back to `grep -rnE '(TODO|FIXME|HACK|XXX)[:( ]' --exclude-dir=node_modules --exclude-dir=.git`.
3. Parse each match into `{ file, line, tag, text }`:
   - `tag` = TODO / FIXME / HACK / XXX
   - `text` = the rest of the comment (strip `//`, `#`, `/*`, `*` leading characters and surrounding whitespace).
4. Deduplicate exact `(file, line, text)` tuples.
5. For each unique entry, call TaskCreate with:
   - `subject` = `[<TAG>] <text truncated to 60 chars>`
   - `description` = full text + `(<file>:<line>)`
   - `metadata` = `{ source: "todo-sync", file, line, tag }`
6. Print a compact summary table at the end:
   - Counts per tag (e.g. `TODO: 12, FIXME: 3, HACK: 1`)
   - Top 5 files by TODO density.

## Rules

- Never modify source files — this skill is read-only.
- If the same TODO already exists in the task list (same `metadata.file` + `metadata.line`), skip it instead of creating a duplicate.
- Cap the run at 200 new tasks; if more matches exist, prompt the user before continuing.
- Treat lines longer than 200 characters as suspicious (likely false positives in minified files) and skip them.

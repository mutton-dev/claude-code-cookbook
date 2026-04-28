#!/bin/bash
# Claude Code statusline: shows the current in-progress task + overall progress %.
#
# Reads the Claude Code task list from $CLAUDE_TASKS_FILE if set, otherwise falls
# back to .claude/tasks.json in the current project. The expected format is the
# JSON array Claude Code itself emits, with each entry having { id, status, subject }.
# Outputs nothing if no task file is present, so the statusline stays empty in
# projects that do not use the task system.

set -eu

tasks_file="${CLAUDE_TASKS_FILE:-.claude/tasks.json}"

if [ ! -f "$tasks_file" ]; then
  exit 0
fi

# Use python for reliable JSON parsing without requiring jq to be installed.
python3 - "$tasks_file" <<'PY' 2>/dev/null || exit 0
import json, sys

path = sys.argv[1]
try:
    with open(path) as f:
        tasks = json.load(f)
except Exception:
    sys.exit(0)

if not isinstance(tasks, list) or not tasks:
    sys.exit(0)

total = len(tasks)
completed = sum(1 for t in tasks if t.get("status") == "completed")
in_progress = [t for t in tasks if t.get("status") == "in_progress"]

pct = int(100 * completed / total) if total else 0

if in_progress:
    current = in_progress[0].get("subject", "task")
    if len(current) > 40:
        current = current[:37] + "..."
    print(f"  {current} ({completed}/{total} · {pct}%)")
else:
    print(f"  {completed}/{total} · {pct}%")
PY

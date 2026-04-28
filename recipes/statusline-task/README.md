# statusline-task

A Claude Code statusline script that surfaces your current in-progress task and overall task list progress, parsed from `.claude/tasks.json`. Useful when you are running a long, multi-step session and want to see at a glance what Claude is currently chewing on.

## What it shows

```
  Run vitest in CI on Node 20 (3/9 · 33%)
```

- ` ` — task glyph (Nerd Font; replace if you do not have one)
- `<subject>` — the first in-progress task's subject, truncated at 40 characters
- `(completed/total · %)` — overall progress

When no task is in progress, only the count + percentage is shown. When the task file is missing, the statusline emits nothing — so it stays clean in projects that do not use Claude Code's task system.

## Install

```bash
mkdir -p .claude
cp recipes/statusline-task/statusline.sh .claude/statusline.sh
chmod +x .claude/statusline.sh
```

Wire it up in `.claude/settings.json`:

```json
{
  "statusline": ".claude/statusline.sh"
}
```

Or:

```bash
npx mutton-cookbook install statusline-task
```

## Dependencies

- `python3` — used for JSON parsing (preinstalled on macOS and most Linux distros).
- That's it. No `jq`, no Node, no shell-magic regex against JSON.

If you prefer `jq`, swapping the python heredoc for `jq -r '...'` is straightforward — see the comments in the script.

## Combining with statusline-git

Claude Code allows only one statusline command, but you can compose:

```bash
#!/bin/bash
git_part="$(.claude/statusline-git.sh)"
task_part="$(.claude/statusline-task.sh)"
echo "$git_part   $task_part"
```

Save as `.claude/statusline.sh` and point settings.json at it.

#!/bin/bash
# Claude Code statusline: shows current git branch + dirty/clean indicator.
# Output is empty when the cwd is not inside a git repository, so it stays clean
# in non-git directories.

set -eu

# Bail silently if not inside a git repo.
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  exit 0
fi

branch="$(git symbolic-ref --short HEAD 2>/dev/null || git rev-parse --short HEAD 2>/dev/null || true)"
if [ -z "$branch" ]; then
  exit 0
fi

# Count uncommitted + untracked changes.
dirty="$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"

# Count commits ahead/behind upstream, if upstream is configured.
ahead_behind=""
if upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)"; then
  ahead="$(git rev-list --count "$upstream"..HEAD 2>/dev/null || echo 0)"
  behind="$(git rev-list --count HEAD.."$upstream" 2>/dev/null || echo 0)"
  if [ "$ahead" != "0" ] || [ "$behind" != "0" ]; then
    ahead_behind=" ↑$ahead ↓$behind"
  fi
fi

if [ "$dirty" -gt 0 ]; then
  printf "  %s ●%s" "$branch" "$ahead_behind"
else
  printf "  %s%s" "$branch" "$ahead_behind"
fi

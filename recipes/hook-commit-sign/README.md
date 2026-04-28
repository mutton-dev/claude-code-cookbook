# hook-commit-sign

A Claude Code `PostToolUse` hook that auto-commits every file edit so you never lose work and always have a granular history to bisect against. Each Claude-driven `Edit`, `Write`, or `MultiEdit` produces a commit, which means `git reflog` and `git log` become a step-by-step record of the agent's actions.

## What it does

After Claude calls a write tool, the hook:

1. Confirms the working directory is a git repo (`-d .git`)
2. Stages everything with `git add -A`
3. Skips the commit if nothing is staged (`git diff --cached --quiet`)
4. Otherwise commits with `chore: auto-commit by Claude Code [HH:MM:SS]`

Pre-commit hooks are still honored — we do not pass `--no-verify`. If a hook blocks the commit, the changes stay staged and Claude sees the failure in the conversation, so you can decide how to proceed.

## Install

```bash
npx mutton-cookbook install hook-commit-sign
```

Or merge `hook.json` into `.claude/settings.json` manually.

## When to use it

This hook is a great fit for:

- **Spike work** — long sessions where you want every step recorded for postmortem.
- **Demos and recordings** — granular history makes it easy to rewind to any point.
- **Pair-with-Claude flows** — if you treat Claude as a junior engineer, you want their commits separable from yours.

It is a poor fit for repos with strict commit-message conventions or merge-queue setups that reject "chore" commits. In those cases, replace the message template with whatever your team requires, or only enable the hook on a scratch branch.

## Customization

- Swap the message template to use your team's Conventional Commits prefix.
- Add `[skip ci]` to the message if you do not want every auto-commit to trigger CI.
- Squash the auto-commits at the end of the session with `git rebase -i` before opening a PR.

# skill-todo-sync

A Claude Code custom skill that scans your codebase for `TODO`, `FIXME`, `HACK`, and `XXX` comments, then turns each one into an actionable task in Claude Code's task list. Useful when you want to triage technical debt, prep a sprint, or audit a codebase you just inherited.

## What it does

When you run `/todo-sync`, the skill:

1. Runs a `git grep` (or `grep` fallback) for all four tag patterns
2. Parses each match into `{ file, line, tag, text }`
3. Deduplicates against any existing tasks created by the same skill
4. Calls `TaskCreate` for every new entry with the file path, line number, and tag preserved as task metadata
5. Prints a summary: counts per tag, top files by TODO density

The skill is read-only — it never edits source files. It also caps a single run at 200 new tasks to avoid drowning your task list when scanning large monorepos for the first time.

## Install

```bash
mkdir -p .claude/skills
cp recipes/skill-todo-sync/skill.md .claude/skills/todo-sync.md
```

Or via the CLI:

```bash
npx mutton-cookbook install skill-todo-sync
```

## Usage

```
/todo-sync
```

The first run will likely surface a long backlog. After that, re-running is cheap because duplicates are skipped via metadata matching.

## Tips

- Scope the scan to a subtree by `cd`-ing first — the skill uses the current working directory as its root.
- Add custom tags by editing the regex in `.claude/skills/todo-sync.md` (e.g. `NOTE`, `DEPRECATED`).
- Pair it with `skill-branch-summary` to capture both shipped and pending work.

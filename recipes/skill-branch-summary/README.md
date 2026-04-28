# skill-branch-summary

A Claude Code custom skill that produces a high-signal summary of every change on the current branch compared to `main` (or `master`). Drop it in when you want a quick recap before opening a pull request, when you are picking up a stale branch from yesterday, or when you need to brief a reviewer on what was actually touched.

## What it does

Once installed, you can trigger the skill from inside Claude Code with `/branch-summary` (or by asking "summarize this branch"). The skill runs `git log`, `git diff --stat`, `git diff --name-status`, and `git status` in parallel, then synthesizes the output into a single Markdown report covering:

1. **What changed** — files and feature areas touched
2. **Why** — motivation inferred from commit messages
3. **Review concerns** — large churn, unrelated edits, missing tests, security-sensitive paths
4. **Uncommitted work** — anything still on the working tree

The skill is read-only: it never stages, commits, pushes, or rewrites history.

## Install

Manual install:

```bash
mkdir -p .claude/skills
cp recipes/skill-branch-summary/skill.md .claude/skills/branch-summary.md
```

Or via the CLI:

```bash
npx mutton-cookbook install skill-branch-summary
```

## Usage

After install, restart Claude Code (or reload skills) and try:

```
/branch-summary
```

The skill works in any git repository. If you are not on a branch ahead of `main`, it tells you so instead of producing an empty report.

## Customization

Edit `.claude/skills/branch-summary.md` to change the comparison base (e.g. `develop` instead of `main`), tweak the section ordering, or adjust the maximum number of files surfaced in the report. The skill instructions are plain Markdown — no rebuild required.

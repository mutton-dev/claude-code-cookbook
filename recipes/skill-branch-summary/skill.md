---
name: branch-summary
description: Summarize all changes on the current git branch vs main. Use when the user asks for a recap of branch work, an outline of in-progress changes, or a quick overview before opening a pull request.
---

# Branch Summary

When invoked, generate a high-signal summary of everything that has changed on the current branch compared to `main`.

## Steps

1. Verify the working directory is a git repository:
   - Run `git rev-parse --is-inside-work-tree` and abort gracefully if it is not.
2. Determine the comparison base:
   - Default to `main`, falling back to `master` if `main` does not exist.
3. Collect raw data with these commands (run in parallel via separate Bash tool calls):
   - `git log <base>..HEAD --oneline --no-decorate`
   - `git diff <base>...HEAD --stat`
   - `git diff <base>...HEAD --name-status`
   - `git status --porcelain` (to flag uncommitted changes)
4. Parse the results and produce a Markdown report with these sections:
   - **Branch**: current branch name and base.
   - **Commits**: bulleted list of commit subjects (most recent first), grouped by feature area when obvious.
   - **Files changed**: top 10 files by lines changed; collapse the rest as `... and N more`.
   - **What changed**: 3–5 bullets describing the user-facing or behavioral changes inferred from diffs and commit messages.
   - **Why (inferred)**: 1–2 bullets pulled from commit message bodies, ticket references, or obvious patterns.
   - **Review concerns**: things a reviewer should look at — large file churn, unrelated changes, missing tests, security-sensitive paths (`auth/`, `.env`, secrets), or commits that touch many areas.
   - **Uncommitted work** (only if `git status` is non-empty): brief note so the user does not forget to stage.

## Output rules

- Keep the entire report under ~250 lines unless the user explicitly asks for more depth.
- Never invent commits or file names — only report what the git commands return.
- If the branch has zero commits ahead of base, say so explicitly instead of producing an empty report.
- Prefer concrete file paths and commit SHAs (short form) over vague references.

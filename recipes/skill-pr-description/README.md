# skill-pr-description

A Claude Code custom skill that auto-generates a complete GitHub pull request description (Summary, Changes, Test plan, Breaking changes, Screenshots placeholder) by reading the current branch's diff against `main`. Saves the 5-minute "what should I write in the PR body" tax on every push.

## What it does

Run `/pr-description` and the skill will:

1. Sanity-check the branch is ahead of base
2. Gather `git log`, `git diff --stat`, `git diff --name-status`, and a full diff sample in parallel
3. Infer the dominant change type from Conventional Commit prefixes
4. Render a Markdown body matching the GitHub PR template most teams already use
5. Suggest a PR title under 70 characters with the right Conventional Commit prefix

The output is wrapped in a fenced code block so you can copy-paste straight into GitHub. Migration files and new dependencies get explicit callouts so reviewers do not miss them.

## Install

```bash
mkdir -p .claude/skills
cp recipes/skill-pr-description/skill.md .claude/skills/pr-description.md
```

Or via the CLI:

```bash
npx mutton-cookbook install skill-pr-description
```

## Usage

```
/pr-description
```

Pair with `gh pr create --body-file <(pbpaste)` (macOS) for a one-liner that opens the PR straight from the generated body.

## Customization

The template lives in `.claude/skills/pr-description.md` — edit the headings to match your team's conventions (e.g. add a "Rollout" section, drop "Screenshots" if you ship a backend). The skill does not invent test plans, so if your team requires specific QA checklists, add them as a static block inside the template.

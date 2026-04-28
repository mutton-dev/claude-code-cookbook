# config-agent-teams

A drop-in `CLAUDE.md` template optimized for Agent Teams workflows: TDD discipline (Red → Green → Refactor → Review), `TeamCreate`-based parallelization, cost-aware model selection (Opus / Sonnet / Haiku), and `TaskCreate` dependency management. Use this when you are starting a new project that will use Claude Code heavily, or when you want to retrofit Agent Teams patterns into an existing repo.

## What's in the template

- **Project context** — placeholder for a 2–4 sentence summary
- **TDD workflow** — Red → Green → Refactor → Review, with explicit guidance on when to skip TDD
- **Agent Teams** — when to use `TeamCreate`, when not to, and how to split work
- **Model selection** — Opus 4.7 for review, Sonnet 4.6 for implementation, Haiku 4.5 for research/sweeps
- **Task tracking** — `TaskCreate` discipline and dependency setup
- **Code style placeholders** — comments, tests, formatting, linting
- **Commit conventions** — Conventional Commits, no `--no-verify`
- **Security** — secret scanning, trust boundary validation, migration safety
- **When stuck** — explicit "stop and ask after 10 minutes" guideline

The template is opinionated but generic — it should slot into a TypeScript repo, a Python repo, a Go repo, or a polyglot monorepo with minor edits to the "Code style" section.

## Install

```bash
npx mutton-cookbook install config-agent-teams
```

If `CLAUDE.md` already exists, the CLI will not overwrite it — you'll get a prompt asking how to proceed.

Or manually:

```bash
cp recipes/config-agent-teams/CLAUDE.md.template ./CLAUDE.md
```

Then fill in the `<placeholder>` blocks with your project specifics.

## Companion recipes

This config pairs naturally with:

- `subagent-reviewer` — wired into the "Review" step of the TDD cycle
- `subagent-test-writer` — wired into the "Red" step
- `hook-security-scan` — enforces the security guidance
- `hook-auto-test` — enforces the TDD green-bar discipline

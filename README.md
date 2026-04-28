# claude-code-cookbook

> Curated Claude Code extension recipes — Custom Skills, Hooks, Subagents, Statuslines, and CLAUDE.md templates. Twelve recipes, every one of them runnable, with a one-command installer.

Part of [Mutton's AI Lab](https://portfolio-mutton.vercel.app/lab).

## Quick start

```bash
# List every recipe
npx mutton-cookbook list

# Install one recipe into the current project
npx mutton-cookbook install skill-branch-summary

# Install everything
npx mutton-cookbook install --all

# Print a recipe's README without installing
npx mutton-cookbook show subagent-reviewer
```

Recipes are installed into the current working directory under `.claude/`. Hooks merge into `.claude/settings.json`, skills go to `.claude/skills/`, subagents go to `.claude/agents/`, statuslines go to `.claude/statusline.sh`, and the `config-agent-teams` template writes `CLAUDE.md` (refusing to overwrite if one already exists).

## Recipes

| Name | Category | Description |
|------|----------|-------------|
| [skill-branch-summary](recipes/skill-branch-summary) | skill | Summarize all changes on the current branch vs main |
| [skill-todo-sync](recipes/skill-todo-sync) | skill | Scan TODO/FIXME/HACK comments and sync into Claude Code tasks |
| [skill-pr-description](recipes/skill-pr-description) | skill | Auto-generate a complete GitHub PR description from the diff |
| [hook-auto-test](recipes/hook-auto-test) | hook | Run `npm test` before every Edit / Write / MultiEdit |
| [hook-commit-sign](recipes/hook-commit-sign) | hook | Auto-commit after every file write for granular history |
| [hook-security-scan](recipes/hook-security-scan) | hook | Block tool calls that contain hardcoded secrets |
| [subagent-researcher](recipes/subagent-researcher) | subagent | Web research agent on Haiku 4.5 with citation discipline |
| [subagent-reviewer](recipes/subagent-reviewer) | subagent | Thorough code review on Opus 4.7 with [blocker]/[suggest]/[nit] tags |
| [subagent-test-writer](recipes/subagent-test-writer) | subagent | Vitest/Jest test generator on Sonnet 4.6 |
| [statusline-git](recipes/statusline-git) | statusline | Git branch + dirty + ahead/behind in your statusline |
| [statusline-task](recipes/statusline-task) | statusline | Current task + progress % in your statusline |
| [config-agent-teams](recipes/config-agent-teams) | config | Drop-in `CLAUDE.md` template for Agent Teams workflows |

## Categories

### Skills (`recipes/skill-*`)

Markdown-defined custom commands you trigger from inside Claude Code (e.g. `/branch-summary`). Each skill ships with a `skill.md` file ready to drop into `.claude/skills/`.

### Hooks (`recipes/hook-*`)

`PreToolUse` and `PostToolUse` shell commands wired into `.claude/settings.json`. The CLI merges them into your existing settings file rather than overwriting.

### Subagents (`recipes/subagent-*`)

Specialized agents you invoke via the `Agent` tool with `subagent_type: "<name>"`. Each ships with an `agent.md` file containing the system prompt, model selection, and tool access list.

### Statuslines (`recipes/statusline-*`)

Shell scripts wired into `settings.json`'s `statusline` field. Refresh fast, stay quiet when there's nothing to say, and degrade gracefully when commands are missing.

### Config (`recipes/config-*`)

Project-level templates — currently a single `CLAUDE.md` template optimized for Agent Teams workflows, with TDD discipline and cost-aware model selection baked in.

## Manual install

If you do not want to use the CLI, every recipe has a `README.md` with copy-paste install instructions. The CLI is just a convenience wrapper around the same file copies and JSON merges you would do by hand.

## Contributing

This is part of an AI Lab portfolio — contributions are not the primary goal, but if you spot a bug or want to add a recipe, open an issue first to discuss fit. Each new recipe must:

1. Live under `recipes/<category>-<short-name>/`
2. Ship with a working `skill.md` / `agent.md` / `hook.json` / `statusline.sh` / `*.template`
3. Include a `README.md` of at least 150 words covering install, usage, and customization
4. Pass `npm test`

## License

MIT

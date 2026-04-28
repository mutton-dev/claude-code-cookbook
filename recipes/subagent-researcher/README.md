# subagent-researcher

A Claude Code subagent specialized for fast, well-cited technical research. Drop it in when you need to answer questions like "what's the latest API for X?", "does library Y still maintain Z?", or "what does RFC nnnn say about W?" — situations where the answer lives on the open web, not in your repo.

## What it does

The agent runs on Claude Haiku 4.5 (cheap and fast), with access to `WebSearch`, `WebFetch`, `Read`, `Bash`, and `Grep`. Its workflow:

1. Clarify the scope — if the question is ambiguous, pick the most likely interpretation and state the assumption.
2. Search broadly with 2–3 query phrasings.
3. Fetch the best 2–4 sources, prioritizing official docs, repos, and standards.
4. Cross-check disagreements between sources.
5. Synthesize a sub-500-word answer with inline `[source: <url>]` citations.

The agent will not edit files, will not invent answers when the web does not have them, and will not maintain state between calls.

## Install

```bash
mkdir -p .claude/agents
cp recipes/subagent-researcher/agent.md .claude/agents/researcher.md
```

Or via the CLI:

```bash
npx mutton-cookbook install subagent-researcher
```

## Usage

From the parent agent (or directly in Claude Code):

```
Use the researcher agent to find out what `fetch` returns when the request times out in the latest Node.js LTS.
```

Or programmatically via the Agent tool with `subagent_type: "researcher"`.

## When to use vs. when not to

**Use it for:** API reference lookups, library comparison, recent changes ("did Vue 3.5 ship X?"), spec questions.

**Skip it for:** anything answerable from the local repo (use `Grep` / `Read` directly), code generation (use a coder agent), or questions requiring authentication to private resources.

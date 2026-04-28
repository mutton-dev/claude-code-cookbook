# subagent-test-writer

A Claude Code subagent that writes a complete, runnable test file for an existing source file. Runs on Claude Sonnet 4.6 — the sweet spot for tasks that need solid reasoning but where Opus would be overkill.

## What it does

Given a source file, the agent:

1. Reads the source and detects the test framework from `package.json` (vitest or jest)
2. Identifies the public API surface — every exported function, class, and constant
3. Writes happy-path, error-path, and edge-case tests for each symbol
4. Mocks external dependencies (network, filesystem, time) using framework primitives
5. Places the test file next to the source (or in `__tests__` / `tests/` if that convention is already in use)
6. Runs the tests and iterates until they pass

The agent will not edit the source file to make tests pass — if the implementation is broken or untestable, it stops and reports the issue rather than silently rewriting your code.

## Install

```bash
mkdir -p .claude/agents
cp recipes/subagent-test-writer/agent.md .claude/agents/test-writer.md
```

Or:

```bash
npx mutton-cookbook install subagent-test-writer
```

## Usage

```
Use the test-writer agent to add tests for src/lib/parse.ts.
```

Pair this with `subagent-reviewer` for a TDD-style flow:

1. You implement the feature
2. `test-writer` produces a test file
3. `reviewer` audits both the implementation and the tests

## Limitations

- The agent does not write integration tests that hit real services — that requires environment setup it cannot make decisions about.
- It does not add new dependencies. If a mocking library is missing, it works around it.
- It assumes the source file has at least one export. Pure side-effect modules (e.g. CLI entry points) need a different testing approach.

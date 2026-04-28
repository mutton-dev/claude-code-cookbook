# subagent-reviewer

A Claude Code subagent for thorough code review. Runs on Claude Opus 4.7 — slower and more expensive than Haiku, but the right model for catching subtle bugs, security issues, and second-order effects in non-trivial diffs.

## What it does

When invoked on a diff (or after a feature is implemented), the reviewer:

1. Reads the diff end-to-end before commenting on anything
2. Pulls in relevant unchanged context (callers, related modules, tests) via `Read`
3. Classifies every finding as one of three tags:
   - `[blocker]` — must fix before merge (bug, regression, security flaw, data loss risk, broken contract)
   - `[suggest]` — meaningful improvement worth doing but not blocking
   - `[nit]` — minor style or wording, take it or leave it
4. Groups findings by file with line references
5. Closes with a brief note on what the change does well

The agent specifically looks at correctness (edge cases, null/undefined, off-by-one), security (input validation, injection, auth), concurrency, test coverage, API surface compatibility, and realistic performance concerns.

## Install

```bash
mkdir -p .claude/agents
cp recipes/subagent-reviewer/agent.md .claude/agents/reviewer.md
```

Or:

```bash
npx mutton-cookbook install subagent-reviewer
```

## Usage

From the parent agent:

```
Use the reviewer agent to review the diff on this branch. Look especially at the auth changes in src/middleware/.
```

Or via the Agent tool with `subagent_type: "reviewer"`. Works well after `subagent-test-writer` has produced new tests, so the reviewer can sanity-check both the implementation and its coverage.

## Cost note

This agent uses Opus 4.7 by design — code review is one of the few tasks where the model upgrade actually pays for itself. If you are reviewing a 1-line config change, use a cheaper agent or skip the review entirely. If you are reviewing 500 lines of new business logic, this is the agent you want.

# hook-auto-test-stop

A Claude Code `Stop` hook that runs your project's test suite once at the end of each conversation — not before every single file edit.

## When to use this vs hook-auto-test

| Recipe | Hook event | Runs |
|---|---|---|
| `hook-auto-test` | `PreToolUse` | Before every `Edit`/`Write`/`MultiEdit` |
| `hook-auto-test-stop` | `Stop` | Once when the conversation ends |

Use `hook-auto-test-stop` when you want a final sanity check without the overhead of running tests on every file touch. It's quieter during long editing sessions and surfaces failures once you're done rather than at every step.

## What it does

When Claude Code ends the conversation (user types `/exit`, session times out, or the agent finishes), the hook runs:

```bash
npm test --if-present
```

Output is truncated to the last 20 lines so failures surface clearly. The hook is non-blocking — a failing test suite does not prevent the session from closing. If you want hard enforcement, add `exit 1` on failure.

The hook is gated on the presence of `package.json` with a `"test"` script, so it is safe in non-npm projects.

## Install

```bash
npx mutton-cookbook install hook-auto-test-stop
```

The CLI deep-merges into `.claude/settings.json` so existing hooks are preserved.

## Customization

- Swap `npm test` for `pnpm test`, `yarn test`, `cargo test`, `go test ./...`, or `pytest -q`.
- Combine with `hook-auto-test` if you want both per-edit checks and a final summary at session end.

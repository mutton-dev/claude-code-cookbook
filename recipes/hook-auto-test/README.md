# hook-auto-test

A Claude Code `PreToolUse` hook that runs your project's test suite before any file edit. Catches regressions early by ensuring you always have a green baseline before Claude starts editing — if tests are already broken, you find out before stacking changes on top.

## What it does

Whenever Claude Code is about to call `Edit`, `Write`, or `MultiEdit`, the hook runs:

```bash
npm test --if-present
```

The output is truncated to the last 20 lines (so failures still surface) and the hook is non-blocking — Claude proceeds even on failure. The intent is informational: you see test status inline in the conversation, but Claude is not stopped from editing. Flip `"blocking": true` (and exit non-zero on failure) if you want hard enforcement.

The hook is gated on the presence of `package.json` with a `"test"` script, so it is safe to drop into projects that do not use npm — it simply prints a "skipping" notice instead of erroring.

## Install

Hooks are configured in `.claude/settings.json`. Merge the contents of `hook.json` into your existing settings, or copy via the CLI:

```bash
npx mutton-cookbook install hook-auto-test
```

The CLI deep-merges the `hooks.PreToolUse` array so it does not clobber existing hooks.

## Manual install

```bash
mkdir -p .claude
# If .claude/settings.json does not exist:
cp recipes/hook-auto-test/hook.json .claude/settings.json
# Otherwise merge the "hooks" key by hand or with `jq -s '.[0] * .[1]'`.
```

## Customization

- Swap `npm test` for `pnpm test`, `yarn test`, `cargo test`, `go test ./...`, or `pytest -q` based on your stack.
- Tighten the matcher to `Edit|MultiEdit` if you only want tests to run on edits to existing files (not new file creation).
- Set `"blocking": true` and have the command `exit 1` on failure to actually halt Claude when tests break.

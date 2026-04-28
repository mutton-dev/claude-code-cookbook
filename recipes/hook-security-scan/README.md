# hook-security-scan

A Claude Code `PreToolUse` hook that scans `Bash` commands and file write payloads for hardcoded secrets — API keys, passwords, tokens, bearer credentials — and **blocks** the tool call when it finds one. The hook exits non-zero with `"blocking": true`, so Claude is forced to stop and revise instead of writing the secret to disk or shipping it to a shell.

## What it does

Two patterns are wired up:

1. **Bash scan**: matches `(api_key|secret|password|token|bearer)\s*=\s*['"][a-zA-Z0-9_\-]{8,}` against `$CLAUDE_TOOL_INPUT_COMMAND`. Triggers on inline secrets in shell commands.
2. **Write/Edit scan**: matches a stricter version (16+ characters, allows `:` or `=`) against `$CLAUDE_TOOL_INPUT_CONTENT`. Triggers on secrets being written into source files.

The two-pattern split exists because shell commands often have shorter inline tokens (e.g. CLI flags), while files containing 16+ character random-looking strings are almost always real secrets.

When a match fires, the hook prints `BLOCKED: hardcoded secret detected ...` and exits 1, which causes Claude Code to abort the tool call and surface the message to the conversation.

## Install

```bash
npx mutton-cookbook install hook-security-scan
```

## False positives

The pattern is intentionally aggressive — it is better to have Claude push back occasionally than to leak a credential. Common false positives:

- Test fixtures with mock tokens → prefix the variable with `mock_` or use `<placeholder>` to bypass.
- Docs and READMEs → use `xxx` / `EXAMPLE_KEY` instead of realistic-looking values.
- TypeScript types where `password: string` is a property name without a value → not matched (the regex requires `= 'value'`).

If the false positive rate gets noisy in your repo, tighten the regex by raising the minimum length to 24 or whitelisting specific paths.

## Production hardening

For a hardened version, swap the inline grep for [`gitleaks`](https://github.com/gitleaks/gitleaks) or [`trufflehog`](https://github.com/trufflesecurity/trufflehog), which use a much larger ruleset and have lower false-positive rates than a hand-rolled regex.

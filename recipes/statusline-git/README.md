# statusline-git

A Claude Code statusline script that shows the current git branch, a dirty-tree indicator, and your ahead/behind counts vs. the upstream branch. Lightweight, dependency-free shell — runs on every status refresh.

## What it shows

Examples of the rendered statusline:

```
   main
   feature/auth ●
   feature/auth ● ↑3 ↓1
```

- ` <branch>` — current branch (uses git's "branch" glyph from Nerd Fonts; falls back gracefully)
- `●` — uncommitted changes present
- `↑N` — N commits ahead of upstream
- `↓N` — N commits behind upstream

The script bails silently in non-git directories, so your statusline stays clean when you `cd` outside a repo.

## Install

```bash
mkdir -p .claude
cp recipes/statusline-git/statusline.sh .claude/statusline.sh
chmod +x .claude/statusline.sh
```

Then in `.claude/settings.json`:

```json
{
  "statusline": ".claude/statusline.sh"
}
```

Or via the CLI:

```bash
npx mutton-cookbook install statusline-git
```

## Performance

Each refresh runs at most 4 short git commands. On a normal repo this is sub-10ms. On very large repos (Linux kernel scale), `git status --porcelain` can be slower — if you notice lag, drop the dirty check and only show the branch name.

## Customization

- Replace the ` ` glyph with `git:` if you do not have a Nerd Font installed.
- Drop the ahead/behind block if you do not push often or work without an upstream.
- Add `--abbrev=8` to the rev-parse fallback for a longer SHA when on detached HEAD.

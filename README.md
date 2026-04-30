# claude-code-cookbook

> Curated Claude Code extension recipes — Custom Skills, Hooks, Subagents, Statuslines, and CLAUDE.md templates. Thirteen recipes, every one of them runnable, with a one-command installer.

```
npx mutton-cookbook install hook-auto-test
Installing hook-auto-test (hook)
  MERGE  .claude/settings.json
```

Part of [Mutton's AI Lab](https://mutton.dev/lab).

---

## Quick start

```bash
# List every recipe
npx mutton-cookbook list

# Install one recipe into the current project
npx mutton-cookbook install skill-branch-summary

# Install everything at once
npx mutton-cookbook install --all

# Print a recipe's README without installing
npx mutton-cookbook show subagent-reviewer
```

Recipes are installed into `.claude/` in the current working directory:

| Category | Installed to |
|---|---|
| skill | `.claude/skills/<name>.md` |
| hook | merged into `.claude/settings.json` |
| subagent | `.claude/agents/<name>.md` |
| statusline | `.claude/statusline.sh` (+ optional settings merge) |
| config | `CLAUDE.md` (skipped if one already exists) |

---

## Recipes

| Name | Category | What it does |
|------|----------|-------------|
| [skill-branch-summary](recipes/skill-branch-summary) | skill | `/branch-summary` — summarize every change on the current branch vs `main` |
| [skill-pr-description](recipes/skill-pr-description) | skill | `/pr-description` — auto-generate Summary, Changes, Test plan for a GitHub PR |
| [skill-todo-sync](recipes/skill-todo-sync) | skill | `/todo-sync` — scan `TODO`/`FIXME`/`HACK` comments and turn them into Claude Code tasks |
| [hook-auto-test](recipes/hook-auto-test) | hook | Run `npm test` **before** every `Edit` / `Write` / `MultiEdit` |
| [hook-auto-test-stop](recipes/hook-auto-test-stop) | hook | Run `npm test` **once at session end** instead of before every edit |
| [hook-commit-sign](recipes/hook-commit-sign) | hook | Auto-commit after every file write for granular history |
| [hook-security-scan](recipes/hook-security-scan) | hook | Block Bash commands and file writes that contain hardcoded secrets |
| [subagent-researcher](recipes/subagent-researcher) | subagent | Fast web research on Haiku 4.5 with citation discipline |
| [subagent-reviewer](recipes/subagent-reviewer) | subagent | Thorough code review on Opus 4.7 — `[blocker]` / `[suggest]` / `[nit]` tags |
| [subagent-test-writer](recipes/subagent-test-writer) | subagent | Vitest / Jest test generator on Sonnet 4.6 |
| [statusline-git](recipes/statusline-git) | statusline | Git branch + dirty indicator + ahead/behind count in the statusline |
| [statusline-task](recipes/statusline-task) | statusline | Current in-progress task + completion % in the statusline |
| [config-agent-teams](recipes/config-agent-teams) | config | Drop-in `CLAUDE.md` template for Agent Teams (TDD, cost-aware model selection) |

---

## Use cases

### Catch regressions before Claude edits

```bash
npx mutton-cookbook install hook-auto-test
```

`Edit` / `Write` / `MultiEdit` のたびに `npm test` を実行。すでにテストが壊れていれば、変更を積み上げる前に気づける。

会話中は静かに、終了時だけ確認したい場合は `hook-auto-test-stop` を代わりに使う。

```bash
npx mutton-cookbook install hook-auto-test-stop   # session end に 1 回だけ
```

---

### Block accidental secret leaks

```bash
npx mutton-cookbook install hook-security-scan
```

`API_KEY=...` `password=` などのパターンを `Bash` コマンドとファイル書き込みの両方でスキャン。マッチしたらツール呼び出しをブロックして Claude に理由を返す。

---

### Never lose an edit session

```bash
npx mutton-cookbook install hook-commit-sign
```

ファイルへの書き込みごとに `chore: auto-commit by Claude Code [HH:MM:SS]` で自動コミット。長いセッションを途中で抜けても変更履歴が追える。

---

### Automate PR descriptions

```bash
npx mutton-cookbook install skill-pr-description
```

`/pr-description` と打つだけで、ブランチの差分から Summary・Changes・Test plan を含む GitHub PR description を生成。

---

### On-demand code review

```bash
npx mutton-cookbook install subagent-reviewer
```

`/review` でバグ・セキュリティ・パフォーマンスの観点から Opus 4.7 がレビュー。`[blocker]` / `[suggest]` / `[nit]` のタグで優先度が明確。

---

### Burn down TODO comments

```bash
npx mutton-cookbook install skill-todo-sync
```

`/todo-sync` でコードベースの `TODO` `FIXME` `HACK` `XXX` を一覧化し、GitHub Issues に変換。放置コメントを確実に消していける。

---

### Recommended combinations

| Goal | Recipes |
|---|---|
| 安全な自動編集セッション | `hook-security-scan` + `hook-auto-test` |
| 放置して帰れる環境 | `hook-auto-test-stop` + `hook-commit-sign` |
| レビュー前の仕上げ | `skill-branch-summary` + `skill-pr-description` |
| 新規プロジェクト一括セットアップ | `install --all` |

---

## Categories

### Skills (`recipes/skill-*`)

Markdown で定義したカスタムコマンドを Claude Code 内から `/skill-name` で呼び出す。`skill.md` が `.claude/skills/` に置かれるだけで有効になる。

### Hooks (`recipes/hook-*`)

`.claude/settings.json` に書き込まれるシェルコマンド。`PreToolUse` は tool 呼び出しの前、`PostToolUse` は後、`Stop` は会話終了時に発火する。CLI はマージインストールするので既存の hooks は消えない。

### Subagents (`recipes/subagent-*`)

`Agent` tool の `subagent_type` で呼び出す専門エージェント。`agent.md` にシステムプロンプト・モデル・ツールリストがまとめて定義されている。

### Statuslines (`recipes/statusline-*`)

`settings.json` の `statusLine` フィールドに設定するシェルスクリプト。高速・無音（表示するものがないときは何も出さない）・コマンド未インストール時も graceful degradation。

### Config (`recipes/config-*`)

プロジェクト用テンプレート。`config-agent-teams` は TDD 規律・コスト意識したモデル選択を組み込んだ `CLAUDE.md` テンプレートで、`CLAUDE.md` が既存の場合は上書きしない。

---

## How it works

CLI が薄いラッパーである点を意識して設計してあります。レシピごとに `README.md` があり、手動で同じファイルコピーと JSON マージをするだけで再現できます。

```
recipes/hook-auto-test/
├── hook.json      ← .claude/settings.json にマージ
└── README.md      ← npx mutton-cookbook show hook-auto-test で表示

recipes/skill-branch-summary/
├── skill.md       ← .claude/skills/branch-summary.md にコピー
└── README.md

recipes/subagent-reviewer/
├── agent.md       ← .claude/agents/reviewer.md にコピー
└── README.md
```

---

## Development

```bash
git clone https://github.com/mutton-dev/claude-code-cookbook
cd claude-code-cookbook
npm install
npm run build       # tsup でビルド
npm test            # vitest — unit tests (40 tests)
npm run test:e2e    # CLI を subprocess で叩く E2E tests (19 tests)
npm run test:all    # unit + E2E 合計 59 tests
```

---

## Contributing

このリポジトリは AI Lab ポートフォリオの一部です。バグ修正や新レシピの追加は Issue で相談してください。新しいレシピの要件：

1. `recipes/<category>-<short-name>/` に配置
2. `skill.md` / `agent.md` / `hook.json` / `statusline.sh` / `*.template` のいずれかを含む
3. install・usage・customization を含む 150 語以上の `README.md`
4. `npm test` が通る

---

## License

MIT — [Mutton's AI Lab](https://mutton.dev/lab)

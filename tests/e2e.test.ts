import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = `node ${resolve(__dirname, '../dist/index.js')}`;

function run(cmd: string, cwd?: string): string {
  return execSync(`${CLI} ${cmd}`, {
    cwd: cwd ?? process.cwd(),
    encoding: 'utf8',
  });
}

describe('CLI E2E — list / show / help', () => {
  it('list shows 13 recipes with header', () => {
    const out = run('list');
    const lines = out.trim().split('\n');
    expect(lines[0]).toContain('NAME');
    expect(lines[0]).toContain('CATEGORY');
    expect(lines).toHaveLength(2 + 13); // header + sep + 13 recipes
  });

  it('list includes hook-auto-test-stop', () => {
    expect(run('list')).toContain('hook-auto-test-stop');
  });

  it('show prints README content', () => {
    const out = run('show hook-auto-test');
    expect(out).toContain('PreToolUse');
    expect(out).toContain('npm test');
  });

  it('--help prints usage without error', () => {
    const out = run('--help');
    expect(out).toContain('mutton-cookbook');
    expect(out).toContain('list');
    expect(out).toContain('install');
  });

  it('help alias works', () => {
    expect(run('help')).toContain('mutton-cookbook');
  });
});

describe('CLI E2E — install', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'cb-e2e-'));
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it('install hook-auto-test creates .claude/settings.json with PreToolUse', () => {
    run('install hook-auto-test', tmp);
    const settingsPath = join(tmp, '.claude/settings.json');
    expect(existsSync(settingsPath)).toBe(true);
    const parsed = JSON.parse(readFileSync(settingsPath, 'utf8'));
    expect(parsed.hooks.PreToolUse).toHaveLength(1);
  });

  it('repeated install does not duplicate hook entry', () => {
    run('install hook-auto-test', tmp);
    run('install hook-auto-test', tmp);
    const parsed = JSON.parse(readFileSync(join(tmp, '.claude/settings.json'), 'utf8'));
    expect(parsed.hooks.PreToolUse).toHaveLength(1);
  });

  it('install hook-auto-test-stop creates Stop hook', () => {
    run('install hook-auto-test-stop', tmp);
    const parsed = JSON.parse(readFileSync(join(tmp, '.claude/settings.json'), 'utf8'));
    expect(parsed.hooks.Stop).toHaveLength(1);
  });

  it('install hook-auto-test then hook-auto-test-stop both coexist', () => {
    run('install hook-auto-test', tmp);
    run('install hook-auto-test-stop', tmp);
    const parsed = JSON.parse(readFileSync(join(tmp, '.claude/settings.json'), 'utf8'));
    expect(parsed.hooks.PreToolUse).toHaveLength(1);
    expect(parsed.hooks.Stop).toHaveLength(1);
  });

  it('install skill creates .claude/skills/<name>.md', () => {
    run('install skill-branch-summary', tmp);
    expect(existsSync(join(tmp, '.claude/skills/branch-summary.md'))).toBe(true);
  });

  it('install subagent creates .claude/agents/<name>.md', () => {
    run('install subagent-researcher', tmp);
    expect(existsSync(join(tmp, '.claude/agents/researcher.md'))).toBe(true);
  });

  it('install statusline creates .claude/statusline.sh and is executable', () => {
    run('install statusline-git', tmp);
    const shPath = join(tmp, '.claude/statusline.sh');
    expect(existsSync(shPath)).toBe(true);
    expect(statSync(shPath).mode & 0o111).toBeGreaterThan(0);
  });

  it('install config creates CLAUDE.md', () => {
    run('install config-agent-teams', tmp);
    expect(existsSync(join(tmp, 'CLAUDE.md'))).toBe(true);
  });

  it('install config skips when CLAUDE.md already exists', () => {
    const claudeMd = join(tmp, 'CLAUDE.md');
    writeFileSync(claudeMd, 'original content');
    const out = run('install config-agent-teams', tmp);
    expect(out).toContain('SKIP');
    expect(readFileSync(claudeMd, 'utf8')).toBe('original content');
  });

  it('install --all installs all 13 recipes without error', () => {
    const out = run('install --all', tmp);
    expect(out).toContain('hook-auto-test');
    expect(out).toContain('hook-auto-test-stop');
    expect(out).toContain('subagent-test-writer');
  });
});

describe('CLI E2E — error cases', () => {
  it('install with invalid name exits 2', () => {
    expect(() => run('install INVALID_NAME')).toThrow();
    try { run('install INVALID_NAME'); } catch (e) {
      expect((e as { status: number }).status).toBe(2);
    }
  });

  it('install with unknown recipe exits 1', () => {
    try { run('install hook-nonexistent'); } catch (e) {
      expect((e as { status: number }).status).toBe(1);
    }
  });

  it('show with unknown recipe exits 1', () => {
    try { run('show nonexistent-recipe'); } catch (e) {
      expect((e as { status: number }).status).toBe(1);
    }
  });

  it('unknown command exits 2', () => {
    try { run('unknown-command'); } catch (e) {
      expect((e as { status: number }).status).toBe(2);
    }
  });
});

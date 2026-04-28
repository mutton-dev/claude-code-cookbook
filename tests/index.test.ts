import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  categorize,
  loadAllRecipes,
  renderList,
  planInstall,
  executeInstall,
  loadRecipe,
  deepMergeJson,
} from '../src/index.js';

describe('categorize', () => {
  it('classifies skill names', () => {
    expect(categorize('skill-foo')).toBe('skill');
  });
  it('classifies hook names', () => {
    expect(categorize('hook-foo')).toBe('hook');
  });
  it('classifies subagent names', () => {
    expect(categorize('subagent-foo')).toBe('subagent');
  });
  it('classifies statusline names', () => {
    expect(categorize('statusline-foo')).toBe('statusline');
  });
  it('classifies config names', () => {
    expect(categorize('config-foo')).toBe('config');
  });
  it('throws on unknown prefix', () => {
    expect(() => categorize('unknown-foo')).toThrow();
  });
});

describe('loadAllRecipes', () => {
  it('finds exactly 12 recipes', () => {
    const recipes = loadAllRecipes();
    expect(recipes).toHaveLength(12);
  });

  it('every recipe has a non-empty title and description', () => {
    const recipes = loadAllRecipes();
    for (const r of recipes) {
      expect(r.title.length).toBeGreaterThan(0);
      expect(r.description.length).toBeGreaterThan(0);
    }
  });

  it('renderList produces a header and one row per recipe', () => {
    const recipes = loadAllRecipes();
    const rendered = renderList(recipes);
    const lines = rendered.split('\n');
    expect(lines[0]).toContain('NAME');
    expect(lines[0]).toContain('CATEGORY');
    expect(lines.length).toBe(2 + recipes.length);
  });
});

describe('deepMergeJson', () => {
  it('concatenates arrays', () => {
    expect(deepMergeJson([1, 2], [3, 4])).toEqual([1, 2, 3, 4]);
  });

  it('merges nested objects', () => {
    const a = { hooks: { PreToolUse: [{ x: 1 }] } };
    const b = { hooks: { PreToolUse: [{ y: 2 }], PostToolUse: [{ z: 3 }] } };
    expect(deepMergeJson(a, b)).toEqual({
      hooks: {
        PreToolUse: [{ x: 1 }, { y: 2 }],
        PostToolUse: [{ z: 3 }],
      },
    });
  });

  it('overlay primitives win over base', () => {
    expect(deepMergeJson({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
  });
});

describe('planInstall + executeInstall', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'cookbook-test-'));
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it('installs a skill into .claude/skills/', () => {
    const recipe = loadRecipe('skill-branch-summary');
    const plan = planInstall(recipe, tmp);
    executeInstall(plan);
    expect(existsSync(join(tmp, '.claude/skills/branch-summary.md'))).toBe(true);
  });

  it('installs a subagent into .claude/agents/', () => {
    const recipe = loadRecipe('subagent-researcher');
    const plan = planInstall(recipe, tmp);
    executeInstall(plan);
    expect(existsSync(join(tmp, '.claude/agents/researcher.md'))).toBe(true);
  });

  it('installs a statusline into .claude/statusline.sh', () => {
    const recipe = loadRecipe('statusline-git');
    const plan = planInstall(recipe, tmp);
    executeInstall(plan);
    expect(existsSync(join(tmp, '.claude/statusline.sh'))).toBe(true);
  });

  it('merges a hook into .claude/settings.json (creating if missing)', () => {
    const recipe = loadRecipe('hook-auto-test');
    const plan = planInstall(recipe, tmp);
    executeInstall(plan);
    const settingsPath = join(tmp, '.claude/settings.json');
    expect(existsSync(settingsPath)).toBe(true);
    const parsed = JSON.parse(readFileSync(settingsPath, 'utf8'));
    expect(parsed.hooks.PreToolUse).toBeDefined();
  });

  it('merges a hook into an existing settings.json without clobbering', () => {
    mkdirSync(join(tmp, '.claude'), { recursive: true });
    const settingsPath = join(tmp, '.claude/settings.json');
    writeFileSync(settingsPath, JSON.stringify({ existing: 'value', hooks: { PreToolUse: [{ matcher: 'X' }] } }));
    const recipe = loadRecipe('hook-auto-test');
    const plan = planInstall(recipe, tmp);
    executeInstall(plan);
    const parsed = JSON.parse(readFileSync(settingsPath, 'utf8'));
    expect(parsed.existing).toBe('value');
    expect(parsed.hooks.PreToolUse.length).toBeGreaterThanOrEqual(2);
  });

  it('skips config install when CLAUDE.md already exists', () => {
    writeFileSync(join(tmp, 'CLAUDE.md'), 'existing content');
    const recipe = loadRecipe('config-agent-teams');
    const plan = planInstall(recipe, tmp);
    expect(plan.steps[0].kind).toBe('skip');
    executeInstall(plan);
    expect(readFileSync(join(tmp, 'CLAUDE.md'), 'utf8')).toBe('existing content');
  });

  it('writes CLAUDE.md when not present', () => {
    const recipe = loadRecipe('config-agent-teams');
    const plan = planInstall(recipe, tmp);
    executeInstall(plan);
    expect(existsSync(join(tmp, 'CLAUDE.md'))).toBe(true);
  });
});

describe('hook recipes contain valid JSON', () => {
  const hookRecipes = ['hook-auto-test', 'hook-commit-sign', 'hook-security-scan'];
  for (const name of hookRecipes) {
    it(`${name}/hook.json parses`, () => {
      const path = `recipes/${name}/hook.json`;
      const content = readFileSync(path, 'utf8');
      expect(() => JSON.parse(content)).not.toThrow();
      const parsed = JSON.parse(content);
      expect(parsed.hooks).toBeDefined();
    });
  }
});

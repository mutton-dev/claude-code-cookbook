#!/usr/bin/env node
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  statSync,
  chmodSync,
} from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const recipesDir = resolve(__dirname, '..', 'recipes');

type Category = 'skill' | 'hook' | 'subagent' | 'statusline' | 'config';

const VALID_RECIPE_NAME = /^[a-z]+-[a-z0-9-]+$/;

export function validateRecipeName(name: string): void {
  if (!VALID_RECIPE_NAME.test(name)) {
    throw new Error(`Invalid recipe name: "${name}"`);
  }
}

interface Recipe {
  name: string;
  category: Category;
  title: string;
  description: string;
  dir: string;
}

export function categorize(name: string): Category {
  if (name.startsWith('skill-')) return 'skill';
  if (name.startsWith('hook-')) return 'hook';
  if (name.startsWith('subagent-')) return 'subagent';
  if (name.startsWith('statusline-')) return 'statusline';
  if (name.startsWith('config-')) return 'config';
  throw new Error(`Cannot categorize recipe: ${name}`);
}

export function listRecipeDirs(root: string = recipesDir): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter((entry) => {
      const full = join(root, entry);
      return statSync(full).isDirectory();
    })
    .sort();
}

export function loadRecipe(name: string, root: string = recipesDir): Recipe {
  const dir = join(root, name);
  const readmePath = join(dir, 'README.md');
  if (!existsSync(readmePath)) {
    throw new Error(`Recipe ${name} is missing README.md`);
  }
  const readme = readFileSync(readmePath, 'utf8');
  const lines = readme.split('\n');
  const titleLine = lines.find((l) => l.startsWith('# ')) ?? `# ${name}`;
  const title = titleLine.replace(/^#\s+/, '').trim();
  const descLine = lines.find((l) => l.trim() && !l.startsWith('#')) ?? '';
  const description = descLine.replace(/^>\s*/, '').trim().slice(0, 120);
  return { name, category: categorize(name), title, description, dir };
}

export function loadAllRecipes(root: string = recipesDir): Recipe[] {
  return listRecipeDirs(root).map((n) => loadRecipe(n, root));
}

function pad(s: string, width: number): string {
  return s.length >= width ? s : s + ' '.repeat(width - s.length);
}

export function renderList(recipes: Recipe[]): string {
  if (recipes.length === 0) return 'No recipes found.';
  const nameW = Math.max(4, ...recipes.map((r) => r.name.length));
  const catW = Math.max(8, ...recipes.map((r) => r.category.length));
  const header = `${pad('NAME', nameW)}  ${pad('CATEGORY', catW)}  DESCRIPTION`;
  const sep = `${'-'.repeat(nameW)}  ${'-'.repeat(catW)}  ${'-'.repeat(40)}`;
  const rows = recipes.map(
    (r) => `${pad(r.name, nameW)}  ${pad(r.category, catW)}  ${r.description}`,
  );
  return [header, sep, ...rows].join('\n');
}

function ensureDir(p: string) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

export function deepMergeJson(base: unknown, overlay: unknown): unknown {
  if (Array.isArray(base) && Array.isArray(overlay)) {
    const seen = new Set(base.map((item) => JSON.stringify(item)));
    return [...base, ...overlay.filter((item) => !seen.has(JSON.stringify(item)))];
  }
  if (
    base &&
    overlay &&
    typeof base === 'object' &&
    typeof overlay === 'object' &&
    !Array.isArray(base) &&
    !Array.isArray(overlay)
  ) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries(overlay as Record<string, unknown>)) {
      if (k in out) {
        out[k] = deepMergeJson(out[k], v);
      } else {
        out[k] = v;
      }
    }
    return out;
  }
  return overlay;
}

export interface InstallPlan {
  steps: Array<{ kind: 'copy' | 'merge-json' | 'skip'; from?: string; to: string; reason?: string }>;
}

export function planInstall(recipe: Recipe, projectRoot: string): InstallPlan {
  const steps: InstallPlan['steps'] = [];
  switch (recipe.category) {
    case 'skill': {
      const src = join(recipe.dir, 'skill.md');
      const dest = join(projectRoot, '.claude', 'skills', `${recipe.name.replace(/^skill-/, '')}.md`);
      steps.push({ kind: 'copy', from: src, to: dest });
      break;
    }
    case 'subagent': {
      const src = join(recipe.dir, 'agent.md');
      const dest = join(projectRoot, '.claude', 'agents', `${recipe.name.replace(/^subagent-/, '')}.md`);
      steps.push({ kind: 'copy', from: src, to: dest });
      break;
    }
    case 'hook': {
      const src = join(recipe.dir, 'hook.json');
      const dest = join(projectRoot, '.claude', 'settings.json');
      steps.push({ kind: 'merge-json', from: src, to: dest });
      break;
    }
    case 'statusline': {
      const src = join(recipe.dir, 'statusline.sh');
      const dest = join(projectRoot, '.claude', 'statusline.sh');
      steps.push({ kind: 'copy', from: src, to: dest });
      const settingsSrc = join(recipe.dir, 'settings.json');
      if (existsSync(settingsSrc)) {
        steps.push({ kind: 'merge-json', from: settingsSrc, to: join(projectRoot, '.claude', 'settings.json') });
      }
      break;
    }
    case 'config': {
      const src = join(recipe.dir, 'CLAUDE.md.template');
      const dest = join(projectRoot, 'CLAUDE.md');
      if (existsSync(dest)) {
        steps.push({ kind: 'skip', to: dest, reason: 'CLAUDE.md already exists; refusing to overwrite' });
      } else {
        steps.push({ kind: 'copy', from: src, to: dest });
      }
      break;
    }
  }
  return { steps };
}

export function executeInstall(plan: InstallPlan): string[] {
  const log: string[] = [];
  for (const step of plan.steps) {
    if (step.kind === 'skip') {
      log.push(`SKIP  ${step.to}  (${step.reason ?? 'no reason'})`);
      continue;
    }
    if (!step.from) continue;
    if (!existsSync(step.from)) {
      log.push(`MISSING  ${step.from}`);
      continue;
    }
    ensureDir(dirname(step.to));
    if (step.kind === 'copy') {
      copyFileSync(step.from, step.to);
      if (step.to.endsWith('.sh')) {
        try {
          chmodSync(step.to, 0o755);
        } catch {
          // chmod unsupported on this platform
        }
      }
      log.push(`COPY  ${step.to}`);
    } else if (step.kind === 'merge-json') {
      const overlay = JSON.parse(readFileSync(step.from, 'utf8'));
      const base = existsSync(step.to) ? JSON.parse(readFileSync(step.to, 'utf8')) : {};
      const merged = deepMergeJson(base, overlay);
      writeFileSync(step.to, JSON.stringify(merged, null, 2) + '\n');
      log.push(`MERGE  ${step.to}`);
    }
  }
  return log;
}

function printUsage(): void {
  console.log(`mutton-cookbook — Curated Claude Code recipes

Usage:
  mutton-cookbook list                 List all available recipes
  mutton-cookbook install <name>       Install a recipe into the current project
  mutton-cookbook install --all        Install every recipe at once
  mutton-cookbook show <name>          Print a recipe's README

Recipes are installed into the current working directory under .claude/.`);
}

function cmdList(): number {
  const recipes = loadAllRecipes();
  console.log(renderList(recipes));
  return 0;
}

function cmdInstall(name: string | undefined, projectRoot: string): number {
  if (!name) {
    console.error('error: install requires a recipe name (or --all)');
    return 2;
  }
  if (name === '--all') {
    const recipes = loadAllRecipes();
    for (const r of recipes) {
      console.log(`\n→ ${r.name}`);
      const plan = planInstall(r, projectRoot);
      const log = executeInstall(plan);
      log.forEach((l) => console.log(`  ${l}`));
    }
    return 0;
  }
  try { validateRecipeName(name); } catch (e) {
    console.error(`error: ${(e as Error).message}`);
    return 2;
  }
  const dir = join(recipesDir, name);
  if (!existsSync(dir)) {
    console.error(`error: recipe not found: ${name}`);
    return 1;
  }
  const recipe = loadRecipe(name);
  console.log(`Installing ${recipe.name} (${recipe.category})`);
  const plan = planInstall(recipe, projectRoot);
  const log = executeInstall(plan);
  log.forEach((l) => console.log(`  ${l}`));
  return 0;
}

function cmdShow(name: string | undefined): number {
  if (!name) {
    console.error('error: show requires a recipe name');
    return 2;
  }
  try { validateRecipeName(name); } catch (e) {
    console.error(`error: ${(e as Error).message}`);
    return 2;
  }
  const readmePath = join(recipesDir, name, 'README.md');
  if (!existsSync(readmePath)) {
    console.error(`error: recipe not found: ${name}`);
    return 1;
  }
  console.log(readFileSync(readmePath, 'utf8'));
  return 0;
}

export function main(argv: string[]): number {
  const [command, ...args] = argv;
  switch (command) {
    case 'list':
      return cmdList();
    case 'install':
      return cmdInstall(args[0], process.cwd());
    case 'show':
      return cmdShow(args[0]);
    case undefined:
    case '--help':
    case '-h':
    case 'help':
      printUsage();
      return 0;
    default:
      console.error(`error: unknown command: ${command}`);
      printUsage();
      return 2;
  }
}

const invokedDirectly =
  process.argv[1] && (process.argv[1] === fileURLToPath(import.meta.url) || process.argv[1].endsWith('mutton-cookbook'));
if (invokedDirectly) {
  process.exit(main(process.argv.slice(2)));
}

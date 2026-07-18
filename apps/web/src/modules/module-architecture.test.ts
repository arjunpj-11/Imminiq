/// <reference types="node" />

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const modulesRoot = join(process.cwd(), 'src', 'modules');
const sourceRoot = join(process.cwd(), 'src');
const allowedModuleDirectories = new Set([
  'components',
  'constants',
  'hooks',
  'pages',
  'store',
  'types',
  'utils',
]);

const scopedModuleRoots = (scope: 'admin' | 'user') => {
  const scopeRoot = join(modulesRoot, scope);
  return readdirSync(scopeRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(scopeRoot, entry.name));
};

const featureModuleRoots = () =>
  readdirSync(modulesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      if (entry.name === 'admin' || entry.name === 'user') {
        return scopedModuleRoots(entry.name);
      }
      return [join(modulesRoot, entry.name)];
    });

const collectFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(path) : [path];
  });

const containsInlineApiPath = (_file: string, source: string): boolean => {
  const apiCall = /\bapi\.(?:get|post|put|patch|delete)\b/g;

  while (apiCall.exec(source)) {
    let angleDepth = 0;
    for (let index = apiCall.lastIndex; index < source.length; index += 1) {
      const character = source[index];
      if (character === '<') angleDepth += 1;
      else if (character === '>' && angleDepth > 0) angleDepth -= 1;
      else if (character === '(' && angleDepth === 0) {
        let argumentIndex = index + 1;
        while (/\s/.test(source[argumentIndex] ?? '')) argumentIndex += 1;
        if (["'", '"', '`'].includes(source[argumentIndex] ?? '')) return true;
        break;
      }
    }
  }

  return /window\.location\.href\s*=\s*`[^`]*\/auth\//.test(source);
};

describe('frontend feature-module architecture', () => {
  it('keeps scoped modules inside feature directories', () => {
    for (const scope of ['admin', 'user'] as const) {
      const filesAtScopeRoot = readdirSync(join(modulesRoot, scope), { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name);

      expect(filesAtScopeRoot, `${scope} contains unscoped feature files`).toEqual([]);
    }
  });

  it('uses the same approved folder vocabulary across feature modules', () => {
    for (const moduleRoot of featureModuleRoots()) {
      const unexpectedDirectories = readdirSync(moduleRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !allowedModuleDirectories.has(entry.name))
        .map((entry) => entry.name);

      expect(unexpectedDirectories, moduleRoot).toEqual([]);
    }
  });

  it('gives every feature an explicit public API', () => {
    const missingPublicApis = featureModuleRoots()
      .filter((moduleRoot) => !existsSync(join(moduleRoot, 'index.ts')))
      .map((moduleRoot) => moduleRoot.replace(`${modulesRoot}/`, ''));

    expect(missingPublicApis).toEqual([]);
  });

  it('centralizes every admin feature query key', () => {
    const violations = scopedModuleRoots('admin').flatMap((moduleRoot) => {
      const hooksRoot = join(moduleRoot, 'hooks');
      if (!existsSync(hooksRoot)) return [];

      const queryKeyFiles = readdirSync(hooksRoot).filter((file) =>
        file.endsWith('.query-keys.ts')
      );
      return queryKeyFiles.length === 1 ? [] : [moduleRoot.replace(`${modulesRoot}/`, '')];
    });

    expect(violations).toEqual([]);
  });

  it('centralizes server-state query keys in every feature', () => {
    const violations = featureModuleRoots().flatMap((moduleRoot) => {
      const hooksRoot = join(moduleRoot, 'hooks');
      if (!existsSync(hooksRoot)) return [];

      const hookFiles = collectFiles(hooksRoot).filter((file) => file.endsWith('.ts'));
      const usesServerQueries = hookFiles.some((file) =>
        /\buse(?:Infinite)?Query\b/.test(readFileSync(file, 'utf8'))
      );
      if (!usesServerQueries) return [];

      const keyOwners = hookFiles.filter((file) => file.endsWith('.query-keys.ts'));
      const issues =
        keyOwners.length === 1
          ? []
          : [`${moduleRoot.replace(`${modulesRoot}/`, '')}: ${keyOwners.length} query-key owners`];

      for (const file of hookFiles.filter((file) => !file.endsWith('.query-keys.ts'))) {
        const source = readFileSync(file, 'utf8');
        if (
          /queryKey:\s*\[/.test(source) ||
          /(?:export\s+)?const\s+\w*(?:Keys|KEY)\s*=/.test(source)
        ) {
          issues.push(file.replace(`${modulesRoot}/`, ''));
        }
      }

      return issues;
    });

    expect(violations).toEqual([]);
  });

  it('gives every admin feature one constants owner', () => {
    const violations = scopedModuleRoots('admin').flatMap((moduleRoot) => {
      const constantsRoot = join(moduleRoot, 'constants');
      if (!existsSync(constantsRoot)) return [moduleRoot.replace(`${modulesRoot}/`, '')];

      const constantsFiles = readdirSync(constantsRoot).filter((file) =>
        file.endsWith('.constants.ts')
      );
      return constantsFiles.length === 1
        ? []
        : [`${moduleRoot.replace(`${modulesRoot}/`, '')}: ${constantsFiles.length}`];
    });

    expect(violations).toEqual([]);
  });

  it('keeps each admin hook focused on one exported operation', () => {
    const violations = scopedModuleRoots('admin')
      .flatMap(collectFiles)
      .filter((file) => /\/hooks\/use[^/]+\.ts$/.test(file))
      .filter((file) => {
        const source = readFileSync(file, 'utf8');
        return [...source.matchAll(/export const (use[A-Z]\w*)/g)].length !== 1;
      })
      .map((file) => file.replace(`${modulesRoot}/`, ''));

    expect(violations).toEqual([]);
  });

  it('keeps admin API paths in feature constants instead of hooks', () => {
    const violations = scopedModuleRoots('admin')
      .flatMap(collectFiles)
      .filter((file) => /\/hooks\/.*\.ts$/.test(file))
      .filter((file) => /['"]\/admin(?:\/|['"])/.test(readFileSync(file, 'utf8')))
      .map((file) => file.replace(`${modulesRoot}/`, ''));

    expect(violations).toEqual([]);
  });

  it('keeps every feature API path in feature constants', () => {
    const violations = featureModuleRoots()
      .flatMap(collectFiles)
      .filter((file) => /\.(?:ts|tsx)$/.test(file) && !file.includes('/constants/'))
      .filter((file) => containsInlineApiPath(file, readFileSync(file, 'utf8')))
      .map((file) => file.replace(`${modulesRoot}/`, ''));

    expect(violations).toEqual([]);
  });

  it('keeps reusable admin UI in the root component library', () => {
    expect(existsSync(join(modulesRoot, 'admin', 'shared'))).toBe(false);
    expect(existsSync(join(sourceRoot, 'components', 'admin', 'index.ts'))).toBe(true);
  });

  it('keeps global API contracts out of the admin component public API', () => {
    const adminComponentIndex = readFileSync(
      join(sourceRoot, 'components', 'admin', 'index.ts'),
      'utf8'
    );
    const violations = scopedModuleRoots('admin')
      .flatMap(collectFiles)
      .filter((file) => {
        const source = readFileSync(file, 'utf8');
        return /import\s+type\s+\{[^}]*\bApiEnvelope\b[^}]*\}\s+from\s+['"][^'"]*components\/admin['"]/s.test(
          source
        );
      })
      .map((file) => file.replace(`${modulesRoot}/`, ''));

    expect(adminComponentIndex).not.toMatch(/\bApiEnvelope\b/);
    expect(violations).toEqual([]);
  });

  it('uses the central route registry for component navigation', () => {
    const violations = collectFiles(sourceRoot)
      .filter((file) => file.endsWith('.tsx'))
      .filter((file) => {
        const source = readFileSync(file, 'utf8');
        return (
          /(?:navigate|onNavigate)\(\s*['"]\//.test(source) ||
          /(?:to|brandTo|actionTo)=['"]\//.test(source)
        );
      })
      .map((file) => file.replace(`${sourceRoot}/`, ''));

    expect(violations).toEqual([]);
  });

  it('passes server errors into admin error states', () => {
    const violations = scopedModuleRoots('admin')
      .flatMap(collectFiles)
      .filter((file) => file.endsWith('.tsx'))
      .filter((file) => /<AdminError\s*\/>/.test(readFileSync(file, 'utf8')))
      .map((file) => file.replace(`${modulesRoot}/`, ''));

    expect(violations).toEqual([]);
  });
});

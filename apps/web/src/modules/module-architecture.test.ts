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

const collectFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(path) : [path];
  });

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
    for (const moduleRoot of [...scopedModuleRoots('admin'), ...scopedModuleRoots('user')]) {
      const unexpectedDirectories = readdirSync(moduleRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !allowedModuleDirectories.has(entry.name))
        .map((entry) => entry.name);

      expect(unexpectedDirectories, moduleRoot).toEqual([]);
    }
  });

  it('gives every admin feature an explicit public API', () => {
    const missingPublicApis = scopedModuleRoots('admin')
      .filter((moduleRoot) => !existsSync(join(moduleRoot, 'index.ts')))
      .map((moduleRoot) => moduleRoot.replace(`${modulesRoot}/`, ''));

    expect(missingPublicApis).toEqual([]);
  });

  it('centralizes every admin feature query key', () => {
    const violations = scopedModuleRoots('admin').flatMap((moduleRoot) => {
      if (moduleRoot === join(modulesRoot, 'admin', 'shared')) return [];
      const hooksRoot = join(moduleRoot, 'hooks');
      if (!existsSync(hooksRoot)) return [];

      const queryKeyFiles = readdirSync(hooksRoot).filter((file) => file.endsWith('.query-keys.ts'));
      return queryKeyFiles.length === 1 ? [] : [moduleRoot.replace(`${modulesRoot}/`, '')];
    });

    expect(violations).toEqual([]);
  });

  it('gives every admin feature one constants owner', () => {
    const violations = scopedModuleRoots('admin').flatMap((moduleRoot) => {
      if (moduleRoot === join(modulesRoot, 'admin', 'shared')) return [];
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

  it('keeps shared admin UI inside the admin module boundary', () => {
    const violations = scopedModuleRoots('admin')
      .flatMap(collectFiles)
      .filter((file) => /components\/admin\//.test(readFileSync(file, 'utf8')))
      .map((file) => file.replace(`${modulesRoot}/`, ''));

    expect(violations).toEqual([]);
  });

  it('uses the central route registry for component navigation', () => {
    const violations = collectFiles(sourceRoot)
      .filter((file) => file.endsWith('.tsx'))
      .filter((file) => {
        const source = readFileSync(file, 'utf8');
        return /(?:navigate|onNavigate)\(\s*['"]\//.test(source) ||
          /(?:to|brandTo|actionTo)=['"]\//.test(source);
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

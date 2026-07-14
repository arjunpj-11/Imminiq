/// <reference types="node" />

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const modulesRoot = join(process.cwd(), 'src', 'modules');
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
});

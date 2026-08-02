import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(import.meta.dirname, '../../../..');

describe('React runtime dependency policy', () => {
  it('uses one exact React version throughout the production dependency tree', () => {
    const rootPackage = JSON.parse(
      readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8')
    ) as {
      dependencies: Record<string, string>;
    };
    const webPackage = JSON.parse(
      readFileSync(resolve(repositoryRoot, 'apps/web/package.json'), 'utf8')
    ) as { dependencies: Record<string, string> };
    const lockfile = JSON.parse(
      readFileSync(resolve(repositoryRoot, 'package-lock.json'), 'utf8')
    ) as { packages: Record<string, { version?: string }> };

    const declaredVersions = [
      rootPackage.dependencies.react,
      rootPackage.dependencies['react-dom'],
      webPackage.dependencies.react,
      webPackage.dependencies['react-dom'],
    ];
    const installedVersions = Object.entries(lockfile.packages)
      .filter(([path]) => /(?:^|\/)node_modules\/(?:react|react-dom)$/.test(path))
      .map(([, entry]) => entry.version)
      .filter((version): version is string => Boolean(version));

    expect(new Set(declaredVersions)).toEqual(new Set(['19.2.8']));
    expect(new Set(installedVersions)).toEqual(new Set(['19.2.8']));
  });
});

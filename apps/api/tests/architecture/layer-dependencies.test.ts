import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceRoot = join(process.cwd(), 'src');
const modulesRoot = join(sourceRoot, 'modules');
const layers = ['domain', 'application', 'infrastructure', 'presentation'] as const;
const moduleScopes = new Set(['user', 'admin']);
const flattenedCategories = new Set([
  'constants',
  'contracts',
  'dtos',
  'errors',
  'mappers',
  'policies',
  'types',
]);

const collectFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(path) : [path];
  });

const collectDirectories = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory()) return [];
    const path = join(directory, entry.name);
    return [path, ...collectDirectories(path)];
  });

const resolveImport = (sourcePath: string, specifier: string): string | null => {
  if (specifier.startsWith('@/')) {
    return join(sourceRoot, specifier.slice(2));
  }
  if (specifier.startsWith('.')) {
    return resolve(dirname(sourcePath), specifier);
  }
  return null;
};

const moduleImports = (sourcePath: string): string[] => {
  const source = readFileSync(sourcePath, 'utf8');
  const imports = source.matchAll(/(?:from\s+|import\s*\(\s*)['"]([^'"]+)['"]/g);
  return [...imports]
    .map((match) => resolveImport(sourcePath, match[1]))
    .filter((path): path is string => path !== null);
};

const importSpecifiers = (sourcePath: string): string[] => {
  const source = readFileSync(sourcePath, 'utf8');
  return [...source.matchAll(/(?:from\s+|import\s*\(\s*)['"]([^'"]+)['"]/g)].map(
    (match) => match[1]
  );
};

const portable = (path: string) => path.split(sep).join('/');

const moduleRoots = () =>
  readdirSync(modulesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const path = join(modulesRoot, entry.name);
      if (!moduleScopes.has(entry.name)) return [path];

      return readdirSync(path, { withFileTypes: true })
        .filter((child) => child.isDirectory())
        .map((child) => join(path, child.name));
    });

const adminFeatureRoots = () =>
  moduleRoots().filter((moduleRoot) => {
    const id = portable(relative(modulesRoot, moduleRoot));
    return id.startsWith('admin/') && id !== 'admin/shared';
  });

const moduleLocation = (path: string) => {
  if (!path.startsWith(`${modulesRoot}${sep}`)) return null;

  const parts = portable(relative(modulesRoot, path)).split('/');
  const scoped = moduleScopes.has(parts[0]);
  const modulePartCount = scoped ? 2 : 1;

  return {
    id: parts.slice(0, modulePartCount).join('/'),
    parts: parts.slice(modulePartCount),
  };
};

describe('clean architecture boundaries', () => {
  it('keeps every module on the same four-layer structure', () => {
    const modules = moduleRoots();

    expect(modules.length).toBeGreaterThan(0);
    for (const moduleRoot of modules) {
      const moduleDirectories = new Set(
        readdirSync(moduleRoot, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
      );
      expect(moduleDirectories, portable(relative(modulesRoot, moduleRoot))).toEqual(
        new Set(layers)
      );
    }
  });

  it('gives every layer a public API barrel', () => {
    const missing = moduleRoots().flatMap((moduleRoot) =>
      layers
        .filter((layer) => !existsSync(join(moduleRoot, layer, 'index.ts')))
        .map((layer) => `${portable(relative(modulesRoot, moduleRoot))}/${layer}/index.ts`)
    );

    expect(missing).toEqual([]);
  });

  it('keeps every admin feature on the canonical entity-repository-use-case layout', () => {
    const violations = adminFeatureRoots().flatMap((moduleRoot) => {
      const id = portable(relative(modulesRoot, moduleRoot));
      const required = [
        join(moduleRoot, 'domain', 'entities'),
        join(moduleRoot, 'domain', 'repositories'),
        join(moduleRoot, 'infrastructure', 'repositories'),
        join(moduleRoot, 'application', 'use-cases'),
      ];
      const missing = required.filter((path) => !existsSync(path));
      return missing.map((path) => `${id}/${portable(relative(moduleRoot, path))}`);
    });

    expect(violations).toEqual([]);
  });

  it('maps every admin feature through an application DTO boundary', () => {
    const violations = adminFeatureRoots().flatMap((moduleRoot) => {
      const applicationFiles = readdirSync(join(moduleRoot, 'application'));
      const dtoFiles = applicationFiles.filter((file) => file.endsWith('.dto.ts'));
      const mapperFiles = applicationFiles.filter((file) => file.endsWith('.mapper.ts'));
      return dtoFiles.length === 1 && mapperFiles.length === 1
        ? []
        : [
            `${portable(relative(modulesRoot, moduleRoot))}: ${dtoFiles.length} DTO, ${mapperFiles.length} mapper`,
          ];
    });

    expect(violations).toEqual([]);
  });

  it('uses the shared admin response adapter in every admin controller', () => {
    const violations = adminFeatureRoots()
      .flatMap((moduleRoot) => collectFiles(join(moduleRoot, 'presentation')))
      .filter((file) => file.endsWith('.controller.ts'))
      .filter((file) => !/sendAdminResult/.test(readFileSync(file, 'utf8')))
      .map((file) => portable(relative(modulesRoot, file)));

    expect(violations).toEqual([]);
  });

  it('centralizes API mount paths in the bootstrap route registry', () => {
    const appSource = readFileSync(join(sourceRoot, 'app.ts'), 'utf8');
    expect(appSource).not.toMatch(/app\.(?:use|get|post|put|patch|delete)\(\s*['"]\/api/);
  });

  it('composes every admin feature through an explicit use-case map', () => {
    const violations = adminFeatureRoots().flatMap((moduleRoot) => {
      const factories = readdirSync(moduleRoot).filter((file) => file.endsWith('.factory.ts'));
      if (factories.length !== 1) return [portable(relative(modulesRoot, moduleRoot))];
      const source = readFileSync(join(moduleRoot, factories[0]), 'utf8');
      return /Composition\s*=\s*\{\s*useCases:/.test(source) && /useCases\s*:/.test(source)
        ? []
        : [portable(relative(modulesRoot, join(moduleRoot, factories[0])))];
    });

    expect(violations).toEqual([]);
  });

  it('keeps admin workflows focused and free of HTTP utility errors', () => {
    const violations = adminFeatureRoots().flatMap((moduleRoot) => {
      const useCasesRoot = join(moduleRoot, 'application', 'use-cases');
      return collectFiles(useCasesRoot)
        .filter((file) => file.endsWith('.usecase.ts'))
        .filter((file) => {
          const source = readFileSync(file, 'utf8');
          return !/export class \w+UseCase/.test(source) || !/\bexecute\s*\(/.test(source) || /ApiError/.test(source);
        })
        .map((file) => portable(relative(modulesRoot, file)));
    });

    expect(violations).toEqual([]);
  });

  it('keeps HTTP utility errors out of admin domain, application, and infrastructure', () => {
    const violations = adminFeatureRoots()
      .flatMap((moduleRoot) =>
        layers
          .filter((layer) => layer !== 'presentation')
          .flatMap((layer) => collectFiles(join(moduleRoot, layer)))
      )
      .filter((file) => /ApiError/.test(readFileSync(file, 'utf8')))
      .map((file) => portable(relative(modulesRoot, file)));

    expect(violations).toEqual([]);
  });

  it('does not recreate flattened one-file category directories', () => {
    const legacyDirectories = collectDirectories(modulesRoot)
      .filter((path) => flattenedCategories.has(path.split(sep).at(-1) ?? ''))
      .map((path) => portable(relative(modulesRoot, path)));

    expect(legacyDirectories).toEqual([]);
  });

  it('prevents domain code from depending on outer layers', () => {
    const violations = collectFiles(modulesRoot)
      .filter((path) => portable(path).includes('/domain/'))
      .flatMap((source) =>
        moduleImports(source)
          .filter((target) => {
            const path = portable(target);
            const targetLayer = moduleLocation(target)?.parts[0];
            return (
              targetLayer === 'application' ||
              targetLayer === 'infrastructure' ||
              targetLayer === 'presentation' ||
              /\/src\/(config|infrastructure)(\/|$)/.test(path)
            );
          })
          .map(
            (target) =>
              `${portable(relative(sourceRoot, source))} -> ${portable(relative(sourceRoot, target))}`
          )
      );

    expect(violations).toEqual([]);
  });

  it('prevents application code from depending on delivery or implementation details', () => {
    const violations = collectFiles(modulesRoot)
      .filter((path) => portable(path).includes('/application/'))
      .flatMap((source) =>
        moduleImports(source)
          .filter((target) => {
            const path = portable(target);
            const targetLayer = moduleLocation(target)?.parts[0];
            return (
              targetLayer === 'infrastructure' ||
              targetLayer === 'presentation' ||
              /\/src\/(config|infrastructure)(\/|$)/.test(path)
            );
          })
          .map(
            (target) =>
              `${portable(relative(sourceRoot, source))} -> ${portable(relative(sourceRoot, target))}`
          )
      );

    expect(violations).toEqual([]);
  });

  it('keeps domain and application independent of external packages', () => {
    const violations = collectFiles(modulesRoot)
      .filter((path) => {
        const portablePath = portable(path);
        return portablePath.includes('/domain/') || portablePath.includes('/application/');
      })
      .flatMap((source) =>
        importSpecifiers(source)
          .filter((specifier) => !specifier.startsWith('.') && !specifier.startsWith('@/'))
          .map((specifier) => `${portable(relative(sourceRoot, source))} -> ${specifier}`)
      );

    expect(violations).toEqual([]);
  });

  it('allows cross-module dependencies only through module public APIs', () => {
    const violations = collectFiles(modulesRoot).flatMap((source) => {
      const sourceModule = moduleLocation(source)?.id;

      return moduleImports(source)
        .filter((target) => {
          const targetLocation = moduleLocation(target);
          if (!targetLocation) return false;

          return (
            targetLocation.id !== sourceModule &&
            targetLocation.parts.length > 0 &&
            targetLocation.parts.join('/') !== 'index'
          );
        })
        .map(
          (target) =>
            `${portable(relative(sourceRoot, source))} -> ${portable(relative(sourceRoot, target))}`
        );
    });

    expect(violations).toEqual([]);
  });

  it('keeps application bootstrap and infrastructure imports behind module public APIs', () => {
    const violations = collectFiles(sourceRoot)
      .filter((source) => !source.startsWith(`${modulesRoot}${sep}`))
      .filter((source) => !portable(source).includes('/src/scripts/'))
      .flatMap((source) =>
        moduleImports(source)
          .filter((target) => {
            const targetLocation = moduleLocation(target);
            if (!targetLocation) return false;

            return (
              targetLocation.parts.length > 0 &&
              targetLocation.parts.join('/') !== 'index'
            );
          })
          .map(
            (target) =>
              `${portable(relative(sourceRoot, source))} -> ${portable(relative(sourceRoot, target))}`
          )
      );

    expect(violations).toEqual([]);
  });

  it('prevents code from importing its own layer barrel', () => {
    const violations = collectFiles(modulesRoot).flatMap((source) => {
      const sourceLocation = moduleLocation(source);
      if (!sourceLocation || sourceLocation.parts.length < 2) return [];

      return moduleImports(source)
        .filter((target) => {
          const targetLocation = moduleLocation(target);
          return (
            targetLocation?.id === sourceLocation.id &&
            targetLocation.parts.length === 1 &&
            targetLocation.parts[0] === sourceLocation.parts[0]
          );
        })
        .map(
          (target) =>
            `${portable(relative(sourceRoot, source))} -> ${portable(relative(sourceRoot, target))}`
        );
    });

    expect(violations).toEqual([]);
  });

  it('keeps repository and use-case return contracts explicit', () => {
    const violations = collectFiles(modulesRoot)
      .filter((path) => /repository.*\.ts$/.test(path) || path.endsWith('.usecase.ts'))
      .filter((path) => /Promise<\s*unknown(?:\[\])?\s*>/.test(readFileSync(path, 'utf8')))
      .map((path) => portable(relative(sourceRoot, path)));

    expect(violations).toEqual([]);
  });

  it('keeps tracker use cases dependent on narrow repository capabilities', () => {
    const trackerUseCasesRoot = join(modulesRoot, 'user', 'trackers', 'application', 'use-cases');
    const violations = collectFiles(trackerUseCasesRoot)
      .filter((path) => path.endsWith('.usecase.ts'))
      .filter((path) => /:\s*ITrackerRepository\b/.test(readFileSync(path, 'utf8')))
      .map((path) => portable(relative(sourceRoot, path)));

    expect(violations).toEqual([]);
  });
});

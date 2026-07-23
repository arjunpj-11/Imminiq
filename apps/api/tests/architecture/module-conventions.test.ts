import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceRoot = join(process.cwd(), 'src');
const modulesRoot = join(sourceRoot, 'modules');
const moduleScopes = new Set(['user', 'admin']);

const portable = (path: string) => path.split(sep).join('/');

const collectFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(path) : [path];
  });

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

const exportPath = (source: string, relativePath: string) =>
  source.includes(`'${relativePath}'`) || source.includes(`"${relativePath}"`);

const exportedInterfaceBodies = (source: string) => {
  const bodies: Array<{ name: string; body: string }> = [];
  for (const declaration of source.matchAll(/export\s+interface\s+(I\w+)\b[^{]*\{/g)) {
    const openingBrace = (declaration.index ?? 0) + declaration[0].lastIndexOf('{');
    let depth = 0;
    for (let index = openingBrace; index < source.length; index += 1) {
      if (source[index] === '{') depth += 1;
      if (source[index] === '}') depth -= 1;
      if (depth === 0) {
        bodies.push({ name: declaration[1], body: source.slice(openingBrace + 1, index) });
        break;
      }
    }
  }
  return bodies;
};

describe('backend module conventions', () => {
  it('uses kebab-case filenames throughout backend source', () => {
    const violations = collectFiles(sourceRoot)
      .filter((path) => path.endsWith('.ts'))
      .map((path) => portable(relative(sourceRoot, path)))
      .filter((path) => {
        const filename = path.split('/').at(-1) ?? '';
        return !/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*\.ts$/.test(filename);
      });

    expect(violations).toEqual([]);
  });

  it('keeps root module public APIs explicit', () => {
    const violations = moduleRoots()
      .map((moduleRoot) => join(moduleRoot, 'index.ts'))
      .filter((path) => /export\s+(?:type\s+)?\*/.test(readFileSync(path, 'utf8')))
      .map((path) => portable(relative(modulesRoot, path)));

    expect(violations).toEqual([]);
  });

  it('exports every top-level application and presentation file from its layer barrel', () => {
    const violations = moduleRoots().flatMap((moduleRoot) =>
      ['application', 'presentation'].flatMap((layer) => {
        const layerRoot = join(moduleRoot, layer);
        const indexSource = readFileSync(join(layerRoot, 'index.ts'), 'utf8');

        return readdirSync(layerRoot, { withFileTypes: true })
          .filter(
            (entry) => entry.isFile() && entry.name.endsWith('.ts') && entry.name !== 'index.ts'
          )
          .map((entry) => `./${entry.name.slice(0, -3)}`)
          .filter((path) => !exportPath(indexSource, path))
          .map(
            (path) => `${portable(relative(modulesRoot, moduleRoot))}/${layer}/index.ts -> ${path}`
          );
      })
    );

    expect(violations).toEqual([]);
  });

  it('exports every use case from its application barrel', () => {
    const violations = moduleRoots().flatMap((moduleRoot) => {
      const applicationRoot = join(moduleRoot, 'application');
      const useCasesRoot = join(applicationRoot, 'use-cases');
      const indexSource = readFileSync(join(applicationRoot, 'index.ts'), 'utf8');

      return readdirSync(useCasesRoot, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.usecase.ts'))
        .map((entry) => `./use-cases/${entry.name.slice(0, -3)}`)
        .filter((path) => !exportPath(indexSource, path))
        .map(
          (path) => `${portable(relative(modulesRoot, moduleRoot))}/application/index.ts -> ${path}`
        );
    });

    expect(violations).toEqual([]);
  });

  it('keeps each concrete use case in one dedicated use-case file', () => {
    const violations = collectFiles(modulesRoot).flatMap((path) => {
      if (!path.endsWith('.ts')) return [];
      const source = readFileSync(path, 'utf8');
      const useCaseClasses = [...source.matchAll(/export\s+class\s+\w+UseCase\b/g)];
      if (useCaseClasses.length === 0) return [];

      return path.endsWith('.usecase.ts') && useCaseClasses.length === 1
        ? []
        : [portable(relative(modulesRoot, path))];
    });

    expect(violations).toEqual([]);
  });

  it('keeps exported input and output types in DTO or contract owners', () => {
    const violations = collectFiles(modulesRoot)
      .filter((path) => path.endsWith('.usecase.ts'))
      .filter((path) =>
        /^export\s+(?:type|enum|const|function)\b/m.test(readFileSync(path, 'utf8'))
      )
      .map((path) => portable(relative(modulesRoot, path)));

    expect(violations).toEqual([]);
  });

  it('imports use-case request and response types instead of declaring them beside workflows', () => {
    const violations = collectFiles(modulesRoot).flatMap((path) => {
      if (!path.endsWith('.usecase.ts')) return [];
      const source = readFileSync(path, 'utf8');
      const inputPort = [...source.matchAll(/export\s+interface\s+I\w+UseCase\s*\{([\s\S]*?)^\}/gm)]
        .map((match) => match[1])
        .join('\n');
      if (!inputPort) return [];

      return [...source.matchAll(/^(?:export\s+)?type\s+(\w+)\b/gm)]
        .map((match) => match[1])
        .filter((name) => new RegExp(`\\b${name}\\b`).test(inputPort))
        .map((name) => `${portable(relative(modulesRoot, path))}: ${name}`);
    });

    expect(violations).toEqual([]);
  });

  it('uses role-specific files for mappers, application errors, and use-case maps', () => {
    const violations = collectFiles(modulesRoot).flatMap((path) => {
      if (!path.endsWith('.ts')) return [];
      const source = readFileSync(path, 'utf8');
      const relativePath = portable(relative(modulesRoot, path));
      const issues: string[] = [];

      if (/export\s+class\s+\w+Mapper\b/.test(source) && !path.endsWith('.mapper.ts')) {
        issues.push(`${relativePath}: mapper`);
      }
      if (/export\s+class\s+\w+ApplicationError\b/.test(source) && !path.endsWith('.error.ts')) {
        issues.push(`${relativePath}: application error`);
      }
      if (
        /export\s+type\s+\w+UseCases\s*=/.test(source) &&
        !path.endsWith('-use-cases.contract.ts')
      ) {
        issues.push(`${relativePath}: use-case map`);
      }

      return issues;
    });

    expect(violations).toEqual([]);
  });

  it('keeps application classes dependent on abstractions instead of concrete collaborators', () => {
    const concreteCollaborators = collectFiles(modulesRoot).flatMap((path) => {
      if (!path.endsWith('.ts')) return [];
      const source = readFileSync(path, 'utf8');
      return [
        ...source.matchAll(
          /export\s+class\s+(\w+(?:Mapper|UseCase|Repository|Service|Gateway|Provider|Store))\b/g
        ),
      ].map((match) => match[1]);
    });

    const violations = collectFiles(modulesRoot).flatMap((path) => {
      if (!portable(path).includes('/application/') || !path.endsWith('.ts')) return [];
      const source = readFileSync(path, 'utf8');
      return concreteCollaborators
        .filter((name) =>
          new RegExp(`private\\s+readonly\\s+_\\w+\\s*:\\s*${name}\\b`).test(source)
        )
        .map((name) => `${portable(relative(modulesRoot, path))}: ${name}`);
    });

    expect(violations).toEqual([]);
  });

  it('injects application services into use cases instead of importing singleton implementations', () => {
    const violations = collectFiles(modulesRoot)
      .filter((path) => path.endsWith('.usecase.ts'))
      .filter((path) =>
        /^import(?!\s+type\b)[^;]+from\s+['"][^'"]*\/services\/[^'"]+\.service['"]/gm.test(
          readFileSync(path, 'utf8')
        )
      )
      .map((path) => portable(relative(modulesRoot, path)));

    expect(violations).toEqual([]);
  });

  it('keeps multi-item workflow orchestration out of HTTP controllers', () => {
    const violations = collectFiles(modulesRoot)
      .filter((path) => path.endsWith('.controller.ts'))
      .filter((path) => /Promise\.(?:all|allSettled)\s*\(/.test(readFileSync(path, 'utf8')))
      .map((path) => portable(relative(modulesRoot, path)));

    expect(violations).toEqual([]);
  });

  it('narrows broad repository and gateway ports to the capabilities each application client uses', () => {
    const broadPorts = new Map<string, string[]>();
    for (const path of collectFiles(modulesRoot).filter((file) => file.endsWith('.ts'))) {
      for (const contract of exportedInterfaceBodies(readFileSync(path, 'utf8'))) {
        if (!/(?:Repository|Gateway)$/.test(contract.name)) continue;
        const methods = [...contract.body.matchAll(/^\s*(\w+)\s*\(/gm)].map((match) => match[1]);
        if (methods.length > 6) broadPorts.set(contract.name, methods);
      }
    }

    const violations = collectFiles(modulesRoot).flatMap((path) => {
      if (!portable(path).includes('/application/') || !path.endsWith('.ts')) return [];
      const source = readFileSync(path, 'utf8');
      return [
        ...source.matchAll(/private\s+readonly\s+(_\w+)\??\s*:\s*(I\w+(?:Repository|Gateway))\b/g),
      ]
        .filter((match) => {
          const methods = broadPorts.get(match[2]);
          if (!methods) return false;
          const used = new Set(
            [...source.matchAll(new RegExp(`this\\.${match[1]}\\??\\.([A-Za-z_]\\w*)`, 'g'))].map(
              (usage) => usage[1]
            )
          );
          return used.size > 0 && used.size < methods.length;
        })
        .map((match) => `${portable(relative(modulesRoot, path))}: ${match[2]}`);
    });

    expect(violations).toEqual([]);
  });
});

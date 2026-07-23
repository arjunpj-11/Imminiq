import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const modulesRoot = join(process.cwd(), 'src', 'modules');

const collectFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(path) : [path];
  });

const sourceFiles = collectFiles(modulesRoot);
const useCaseFiles = sourceFiles.filter((path) => path.endsWith('.usecase.ts'));
const controllerContractFiles = sourceFiles.filter((path) =>
  path.endsWith('-use-cases.contract.ts')
);
const factoryFiles = sourceFiles.filter((path) => path.endsWith('.factory.ts'));
const rootModuleServiceFiles = sourceFiles.filter((path) =>
  /[/\\]modules[/\\][^/\\]+[/\\][^/\\]+\.service\.ts$/.test(path)
);

const applicationContractFiles = sourceFiles.filter(
  (path) =>
    /[/\\]application[/\\]/.test(path) &&
    (path.endsWith('.usecase.ts') || path.endsWith('.service.ts') || path.endsWith('.contract.ts'))
);
const applicationFiles = sourceFiles.filter((path) => /[/\\]application[/\\]/.test(path));

const exportedInterfaceBodies = (source: string) => {
  const bodies: Array<{ name: string; body: string }> = [];
  const declarations = source.matchAll(/export\s+interface\s+(I\w+)\b[^{]*{/g);

  for (const declaration of declarations) {
    const openingBrace = (declaration.index ?? 0) + declaration[0].lastIndexOf('{');
    let depth = 0;
    for (let index = openingBrace; index < source.length; index += 1) {
      if (source[index] === '{') depth += 1;
      if (source[index] === '}') depth -= 1;
      if (depth === 0) {
        bodies.push({
          name: declaration[1],
          body: source.slice(openingBrace + 1, index),
        });
        break;
      }
    }
  }

  return bodies;
};

describe('use-case input ports', () => {
  it('requires every concrete use case to implement an exported interface', () => {
    expect(useCaseFiles.length).toBeGreaterThan(0);

    for (const path of useCaseFiles) {
      const source = readFileSync(path, 'utf8');
      const classDeclaration = source.match(/\bexport\s+class\s+(\w+UseCase)\b([^{}]*)\{/);
      const className = classDeclaration?.[1];
      const interfaceName = `I${className}`;
      const hasInputPort = new RegExp(`\\bexport\\s+interface\\s+${interfaceName}\\b`).test(source);
      const implementsInputPort = new RegExp(`\\bimplements\\s+${interfaceName}\\b`).test(
        classDeclaration?.[2] ?? ''
      );

      expect(
        classDeclaration,
        `Missing exported concrete use-case class in ${path}`
      ).not.toBeNull();
      expect(hasInputPort, `Missing exported input port ${interfaceName} in ${path}`).toBe(true);
      expect(implementsInputPort, `${className} must implement ${interfaceName} in ${path}`).toBe(
        true
      );
    }
  });

  it('requires controller contracts to reference interfaces, not concrete classes', () => {
    for (const path of controllerContractFiles) {
      const source = readFileSync(path, 'utf8');
      expect(source, path).not.toMatch(/Application\.(?!I[A-Z])\w+UseCase/);
    }
  });

  it('requires factories to consume application use-case contracts', () => {
    for (const path of factoryFiles) {
      const source = readFileSync(path, 'utf8');
      expect(source, path).not.toMatch(/export type \w+UseCases\s*=\s*\{/);
    }
  });

  it('prevents root module service facades from wrapping use cases', () => {
    expect(rootModuleServiceFiles).toEqual([]);
  });

  it('requires named use-case inputs and outputs', () => {
    for (const path of useCaseFiles) {
      const source = readFileSync(path, 'utf8');
      const inputPort = source.match(/export\s+interface\s+I\w+UseCase\s*\{([\s\S]*?)\n\}/)?.[1];

      expect(inputPort, `Missing use-case input port body in ${path}`).toBeDefined();
      expect(inputPort, `Anonymous execute parameter in ${path}`).not.toMatch(/:\s*\{/);
      expect(inputPort, `Anonymous Promise result in ${path}`).not.toMatch(/Promise<\s*\{/);
    }
  });

  it('keeps application contracts free of erased object and any results', () => {
    for (const path of applicationContractFiles) {
      const source = readFileSync(path, 'utf8');
      expect(source, path).not.toMatch(/Promise<\s*(?:object|any)\s*>/);
    }
  });

  it('uses named object contracts in every exported application port', () => {
    const violations: string[] = [];

    for (const path of applicationFiles) {
      const sourceText = readFileSync(path, 'utf8');
      for (const contract of exportedInterfaceBodies(sourceText)) {
        const methods = contract.body.matchAll(/\b(\w+)\s*\(([\s\S]*?)\)\s*:\s*([\s\S]*?);/g);
        for (const method of methods) {
          if (/:\s*\{/.test(method[2]) || /\{/.test(method[3])) {
            violations.push(`${path} ${contract.name}.${method[1]}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});

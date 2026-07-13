import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

const modulesRoot = join(process.cwd(), 'src', 'modules')

const collectFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? collectFiles(path) : [path]
  })

const sourceFiles = collectFiles(modulesRoot)
const useCaseFiles = sourceFiles.filter((path) => path.endsWith('.usecase.ts'))
const controllerContractFiles = sourceFiles.filter((path) =>
  path.endsWith('-use-cases.contract.ts'),
)
const factoryFiles = sourceFiles.filter((path) => path.endsWith('.factory.ts'))
const rootModuleServiceFiles = sourceFiles.filter((path) =>
  /[/\\]modules[/\\][^/\\]+[/\\][^/\\]+\.service\.ts$/.test(path),
)

describe('use-case input ports', () => {
  it('requires every concrete use case to implement an exported interface', () => {
    expect(useCaseFiles.length).toBeGreaterThan(0)

    for (const path of useCaseFiles) {
      const source = readFileSync(path, 'utf8')
      const sourceFile = ts.createSourceFile(
        path,
        source,
        ts.ScriptTarget.Latest,
        true,
      )
      const declarations = sourceFile.statements.filter(
        (statement) =>
          statement.modifiers?.some(
            (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
          ),
      )
      const useCaseClass = declarations.find(
        (statement): statement is ts.ClassDeclaration =>
          ts.isClassDeclaration(statement) &&
          Boolean(statement.name?.text.endsWith('UseCase')),
      )
      const className = useCaseClass?.name?.text
      const interfaceName = `I${className}`
      const hasInputPort = declarations.some(
        (statement) =>
          ts.isInterfaceDeclaration(statement) &&
          statement.name.text === interfaceName,
      )
      const implementsInputPort = useCaseClass?.heritageClauses?.some(
        (clause) =>
          clause.token === ts.SyntaxKind.ImplementsKeyword &&
          clause.types.some((type) => type.expression.getText() === interfaceName),
      )

      expect(className, path).toBeDefined()
      expect(hasInputPort, path).toBe(true)
      expect(implementsInputPort, path).toBe(true)
    }
  })

  it('requires controller contracts to reference interfaces, not concrete classes', () => {
    for (const path of controllerContractFiles) {
      const source = readFileSync(path, 'utf8')
      expect(source, path).not.toMatch(/Application\.(?!I)\w+UseCase/)
    }
  })

  it('requires factories to consume application use-case contracts', () => {
    for (const path of factoryFiles) {
      const source = readFileSync(path, 'utf8')
      expect(source, path).not.toMatch(/export type \w+UseCases\s*=\s*\{/)
    }
  })

  it('prevents root module service facades from wrapping use cases', () => {
    expect(rootModuleServiceFiles).toEqual([])
  })
})

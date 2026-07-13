import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
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
      const classDeclaration = source.match(
        /\bexport\s+class\s+(\w+UseCase)\b([^{}]*)\{/,
      )
      const className = classDeclaration?.[1]
      const interfaceName = `I${className}`
      const hasInputPort = new RegExp(
        `\\bexport\\s+interface\\s+${interfaceName}\\b`,
      ).test(source)
      const implementsInputPort = new RegExp(
        `\\bimplements\\s+${interfaceName}\\b`,
      ).test(classDeclaration?.[2] ?? '')

      expect(
        classDeclaration,
        `Missing exported concrete use-case class in ${path}`,
      ).not.toBeNull()
      expect(
        hasInputPort,
        `Missing exported input port ${interfaceName} in ${path}`,
      ).toBe(true)
      expect(
        implementsInputPort,
        `${className} must implement ${interfaceName} in ${path}`,
      ).toBe(true)
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

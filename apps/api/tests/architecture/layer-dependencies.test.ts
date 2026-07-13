import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const sourceRoot = join(process.cwd(), 'src')
const modulesRoot = join(sourceRoot, 'modules')
const layers = ['domain', 'application', 'infrastructure', 'presentation'] as const
const flattenedCategories = new Set([
  'constants',
  'contracts',
  'dtos',
  'errors',
  'mappers',
  'policies',
  'types',
])

const collectFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? collectFiles(path) : [path]
  })

const collectDirectories = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory()) return []
    const path = join(directory, entry.name)
    return [path, ...collectDirectories(path)]
  })

const resolveImport = (sourcePath: string, specifier: string): string | null => {
  if (specifier.startsWith('@/')) {
    return join(sourceRoot, specifier.slice(2))
  }
  if (specifier.startsWith('.')) {
    return resolve(dirname(sourcePath), specifier)
  }
  return null
}

const moduleImports = (sourcePath: string): string[] => {
  const source = readFileSync(sourcePath, 'utf8')
  const imports = source.matchAll(
    /(?:from\s+|import\s*\(\s*)['"]([^'"]+)['"]/g,
  )
  return [...imports]
    .map((match) => resolveImport(sourcePath, match[1]))
    .filter((path): path is string => path !== null)
}

const importSpecifiers = (sourcePath: string): string[] => {
  const source = readFileSync(sourcePath, 'utf8')
  return [...source.matchAll(/(?:from\s+|import\s*\(\s*)['"]([^'"]+)['"]/g)]
    .map((match) => match[1])
}

const portable = (path: string) => path.split(sep).join('/')

describe('clean architecture boundaries', () => {
  it('keeps every module on the same four-layer structure', () => {
    const modules = readdirSync(modulesRoot, { withFileTypes: true }).filter(
      (entry) => entry.isDirectory(),
    )

    expect(modules.length).toBeGreaterThan(0)
    for (const module of modules) {
      const moduleDirectories = new Set(
        readdirSync(join(modulesRoot, module.name), { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name),
      )
      expect(moduleDirectories, module.name).toEqual(new Set(layers))
    }
  })

  it('does not recreate flattened one-file category directories', () => {
    const legacyDirectories = collectDirectories(modulesRoot)
      .filter((path) => flattenedCategories.has(path.split(sep).at(-1) ?? ''))
      .map((path) => portable(relative(modulesRoot, path)))

    expect(legacyDirectories).toEqual([])
  })

  it('prevents domain code from depending on outer layers', () => {
    const violations = collectFiles(modulesRoot)
      .filter((path) => portable(path).includes('/domain/'))
      .flatMap((source) =>
        moduleImports(source)
          .filter((target) => {
            const path = portable(target)
            return (
              /\/modules\/[^/]+\/(application|infrastructure|presentation)(\/|$)/.test(path) ||
              /\/src\/(config|infrastructure)(\/|$)/.test(path)
            )
          })
          .map((target) => `${portable(relative(sourceRoot, source))} -> ${portable(relative(sourceRoot, target))}`),
      )

    expect(violations).toEqual([])
  })

  it('prevents application code from depending on delivery or implementation details', () => {
    const violations = collectFiles(modulesRoot)
      .filter((path) => portable(path).includes('/application/'))
      .flatMap((source) =>
        moduleImports(source)
          .filter((target) => {
            const path = portable(target)
            return (
              /\/modules\/[^/]+\/(infrastructure|presentation)(\/|$)/.test(path) ||
              /\/src\/(config|infrastructure)(\/|$)/.test(path)
            )
          })
          .map((target) => `${portable(relative(sourceRoot, source))} -> ${portable(relative(sourceRoot, target))}`),
      )

    expect(violations).toEqual([])
  })

  it('keeps domain and application independent of external packages', () => {
    const violations = collectFiles(modulesRoot)
      .filter((path) => {
        const portablePath = portable(path)
        return (
          portablePath.includes('/domain/') ||
          portablePath.includes('/application/')
        )
      })
      .flatMap((source) =>
        importSpecifiers(source)
          .filter(
            (specifier) =>
              !specifier.startsWith('.') && !specifier.startsWith('@/'),
          )
          .map(
            (specifier) =>
              `${portable(relative(sourceRoot, source))} -> ${specifier}`,
          ),
      )

    expect(violations).toEqual([])
  })

  it('allows cross-module dependencies only through module public APIs', () => {
    const violations = collectFiles(modulesRoot).flatMap((source) => {
      const sourceModule = portable(relative(modulesRoot, source)).split('/')[0]

      return moduleImports(source)
        .filter((target) => {
          if (!target.startsWith(`${modulesRoot}${sep}`)) {
            return false
          }

          const relativeTarget = portable(relative(modulesRoot, target))
          const [targetModule, ...targetParts] = relativeTarget.split('/')

          return (
            targetModule !== sourceModule &&
            targetParts.length > 0 &&
            targetParts.join('/') !== 'index'
          )
        })
        .map(
          (target) =>
            `${portable(relative(sourceRoot, source))} -> ${portable(relative(sourceRoot, target))}`,
        )
    })

    expect(violations).toEqual([])
  })

  it('keeps repository and use-case return contracts explicit', () => {
    const violations = collectFiles(modulesRoot)
      .filter(
        (path) =>
          /repository.*\.ts$/.test(path) || path.endsWith('.usecase.ts'),
      )
      .filter((path) => /Promise<\s*unknown(?:\[\])?\s*>/.test(
        readFileSync(path, 'utf8'),
      ))
      .map((path) => portable(relative(sourceRoot, path)))

    expect(violations).toEqual([])
  })

  it('keeps tracker use cases dependent on narrow repository capabilities', () => {
    const trackerUseCasesRoot = join(
      modulesRoot,
      'trackers',
      'application',
      'use-cases',
    )
    const violations = collectFiles(trackerUseCasesRoot)
      .filter((path) => path.endsWith('.usecase.ts'))
      .filter((path) => /:\s*ITrackerRepository\b/.test(
        readFileSync(path, 'utf8'),
      ))
      .map((path) => portable(relative(sourceRoot, path)))

    expect(violations).toEqual([])
  })
})

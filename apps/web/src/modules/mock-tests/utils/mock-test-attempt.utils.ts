import type {
  MockTestCodeRunResponse,
  MockTestCodingLanguage,
  PublicMockTestQuestion,
} from '../types/mock-tests.types'

export type Confidence = 'low' | 'medium' | 'high' | null

export interface CompilerLanguageOption {
  label: string
  value: MockTestCodingLanguage
  fileName: string
  languageId: number
}

export const COMPILER_LANGUAGES: CompilerLanguageOption[] = [
  { label: 'JavaScript', value: 'javascript', fileName: 'main.js', languageId: 63 },
  { label: 'TypeScript', value: 'typescript', fileName: 'main.ts', languageId: 74 },
  { label: 'Python', value: 'python', fileName: 'main.py', languageId: 71 },
  { label: 'Java', value: 'java', fileName: 'Main.java', languageId: 62 },
  { label: 'C++', value: 'cpp', fileName: 'main.cpp', languageId: 54 },
  { label: 'C', value: 'c', fileName: 'main.c', languageId: 50 },
]

export const findCompilerLanguage = (
  language?: string | null,
): CompilerLanguageOption =>
  COMPILER_LANGUAGES.find((item) => item.value === language) ??
  COMPILER_LANGUAGES[0]

export const formatJsonValue = (value: unknown) => {
  if (typeof value === 'string') return value

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export const getStarterCode = (
  question: PublicMockTestQuestion | undefined,
  language: MockTestCodingLanguage,
) => {
  if (!question?.coding) return ''

  return question.coding.templates?.[language] || question.coding.starterCode || ''
}

export const buildCompilerOutput = (
  data?: MockTestCodeRunResponse | null,
) => {
  if (!data) return '> Ready to run your code'

  return [
    data.stdout ? `STDOUT:\n${data.stdout}` : '',
    data.stderr ? `STDERR:\n${data.stderr}` : '',
    data.compileOutput ? `COMPILE OUTPUT:\n${data.compileOutput}` : '',
    data.message ? `MESSAGE:\n${data.message}` : '',
    data.status?.description ? `STATUS: ${data.status.description}` : '',
    `TEST CASES: ${data.passedCount}/${data.totalCount} passed`,
  ]
    .filter(Boolean)
    .join('\n\n')
}

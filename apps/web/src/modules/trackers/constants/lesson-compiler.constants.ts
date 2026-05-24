import type { CompilerLanguageOption } from '../types/lesson.types'

export const COMPILER_LANGUAGES: CompilerLanguageOption[] = [
  { label: 'JavaScript', value: 'javascript', fileName: 'main.js', languageId: 63 },
  { label: 'TypeScript', value: 'typescript', fileName: 'main.ts', languageId: 74 },
  { label: 'Python', value: 'python', fileName: 'main.py', languageId: 71 },
  { label: 'Java', value: 'java', fileName: 'Main.java', languageId: 62 },
  { label: 'C++', value: 'cpp', fileName: 'main.cpp', languageId: 54 },
  { label: 'C', value: 'c', fileName: 'main.c', languageId: 50 },
]

export const DEFAULT_CHAT_GREETING = 'Hello Scholar! Ask me anything about this lesson.'

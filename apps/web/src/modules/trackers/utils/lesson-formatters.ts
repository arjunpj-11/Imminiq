import { COMPILER_LANGUAGES } from '../constants/lesson-compiler.constants'

export const getRoadmapStackStorageKey = (trackerId?: string) =>
  `imminiq_roadmap_stack_${trackerId || 'unknown'}`

export const getInitials = (name: string) =>
  name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()

export const formatLevelLabel = (isPremium: boolean) =>
  isPremium ? 'Imminiq Pro' : 'Free Scholar'

export const formatLessonType = (value: string) =>
  value.split('_').join(' ').replace(/\w/g, (letter) => letter.toUpperCase())

export const getLanguageId = (language: string) => {
  const normalized = language.toLowerCase()
  if (normalized.includes('javascript') || normalized.includes('node') || normalized === 'js') return 63
  if (normalized.includes('typescript') || normalized === 'ts') return 74
  if (normalized.includes('python') || normalized === 'py') return 71
  if (normalized.includes('java')) return 62
  if (normalized.includes('cpp') || normalized.includes('c++')) return 54
  if (normalized === 'c') return 50
  return 63
}

export const findCompilerLanguage = (language: string) => {
  const normalized = language.toLowerCase().trim()
  const languageId = getLanguageId(normalized)
  return (
    COMPILER_LANGUAGES.find((item) => {
      return (
        item.languageId === languageId ||
        normalized.includes(item.value) ||
        item.value.includes(normalized) ||
        item.label.toLowerCase() === normalized
      )
    }) || COMPILER_LANGUAGES[0]
  )
}

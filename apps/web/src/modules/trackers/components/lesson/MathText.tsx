import { cn } from '../../utils/tracker-ui'
import { formatMathTextToHtml } from '../../utils/lesson-content.utils'

export default function MathText({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        'math-text whitespace-pre-wrap',
        '[&_sup]:text-[0.72em] [&_sup]:align-super',
        '[&_sub]:text-[0.72em] [&_sub]:align-sub',
        className
      )}
      dangerouslySetInnerHTML={{ __html: formatMathTextToHtml(children) }}
    />
  )
}

const getLanguageId = (language: string) => {
  const normalized = language.toLowerCase()
  if (normalized.includes('javascript') || normalized.includes('node') || normalized === 'js') return 63
  if (normalized.includes('typescript') || normalized === 'ts') return 74
  if (normalized.includes('python') || normalized === 'py') return 71
  if (normalized.includes('java')) return 62
  if (normalized.includes('cpp') || normalized.includes('c++')) return 54
  if (normalized === 'c') return 50
  return 63
}

const findCompilerLanguage = (language: string) => {
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

// ─── LessonChatCard ──────────────────────────────────────────────────────────

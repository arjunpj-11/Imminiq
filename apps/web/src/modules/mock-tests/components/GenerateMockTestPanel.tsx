// ============================================================
// GenerateMockTestPanel.tsx — aligned with Trackers card style
// ============================================================

import {
  DIFFICULTY_OPTIONS,
  QUESTION_TYPE_OPTIONS,
} from '../constants/mock-tests.constants'
import { useGenerateMockTest } from '../hooks/useMockTests'
import { useMockTestsStore } from '../store/mockTests.store'
import { cn } from '../utils/mock-tests-formatters'
import { SparklesIcon } from './MockTestIcons'
import type { QuestionType } from '../types/mock-tests.types'
import { getUserFacingError } from '../../../lib/user-facing-error'

export function GenerateMockTestPanel() {
  const { generateDraft, updateGenerateDraft, resetGenerateDraft } =
    useMockTestsStore()
  const generateMutation = useGenerateMockTest()

  const toggleType = (type: QuestionType) => {
    const exists = generateDraft.questionTypes.includes(type)

    const next = exists
      ? generateDraft.questionTypes.filter((item) => item !== type)
      : [...generateDraft.questionTypes, type]

    updateGenerateDraft({ questionTypes: next.length ? next : ['mcq'] })
  }

  const submit = async () => {
    if (!generateDraft.topic.trim()) return

    await generateMutation.mutateAsync(generateDraft)
    resetGenerateDraft()
  }

  return (
    <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
      {/* header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-(--brand-500) dark:text-(--brand-500)">
          <SparklesIcon />
        </span>

        <h3 className="font-ui text-[17px] font-black text-(--text-primary) dark:text-(--text-primary)">
          Generate AI mock test
        </h3>
      </div>

      <div className="space-y-3">
        {/* topic input */}
        <input
          value={generateDraft.topic}
          onChange={(e) => updateGenerateDraft({ topic: e.target.value })}
          placeholder="Topic, e.g. Recursion"
          className="w-full rounded-xl border border-(--border-subtle) bg-(--surface-canvas) px-4 py-3 text-sm text-(--text-primary) outline-none transition placeholder:text-[#9b8f87] focus:border-(--brand-500) focus:bg-(--surface-card) dark:border-(--border-subtle) dark:bg-(--surface-canvas) dark:text-(--text-primary) dark:placeholder:text-[#6b6560] dark:focus:border-(--brand-500)"
        />

        {/* difficulty + count row */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={generateDraft.difficulty}
            onChange={(e) =>
              updateGenerateDraft({
                difficulty: e.target.value as typeof generateDraft.difficulty,
              })
            }
            className="rounded-xl border border-(--border-subtle) bg-(--surface-canvas) px-3 py-3 text-sm text-(--text-primary) outline-none transition focus:border-(--brand-500) focus:bg-(--surface-card) dark:border-(--border-subtle) dark:bg-(--surface-canvas) dark:text-(--text-primary) dark:focus:border-(--brand-500)"
          >
            {DIFFICULTY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            max={50}
            value={generateDraft.questionCount}
            onChange={(e) =>
              updateGenerateDraft({ questionCount: Number(e.target.value) })
            }
            className="rounded-xl border border-(--border-subtle) bg-(--surface-canvas) px-3 py-3 text-sm text-(--text-primary) outline-none transition focus:border-(--brand-500) focus:bg-(--surface-card) dark:border-(--border-subtle) dark:bg-(--surface-canvas) dark:text-(--text-primary) dark:focus:border-(--brand-500)"
          />
        </div>

        {/* question type chips */}
        <div className="flex flex-wrap gap-2">
          {QUESTION_TYPE_OPTIONS.map((type) => {
            const isSelected = generateDraft.questionTypes.includes(type)

            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={cn(
                  'rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold capitalize tracking-[0.08em] transition hover:-translate-y-px',
                  isSelected
                    ? 'border-(--brand-500) bg-(--brand-500) text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] dark:border-(--brand-500) dark:bg-(--brand-500) dark:text-white'
                    : 'border-(--border-subtle) bg-white/35 text-(--text-secondary) hover:border-(--brand-500) hover:text-(--brand-500) dark:border-(--border-subtle) dark:bg-transparent dark:text-(--text-secondary) dark:hover:border-white/20 dark:hover:text-[#f2f0eb]'
                )}
              >
                {type.replace('_', ' ')}
              </button>
            )
          })}
        </div>

        {/* submit */}
        <button
          type="button"
          onClick={submit}
          disabled={generateMutation.isPending || !generateDraft.topic.trim()}
          className="w-full rounded-xl bg-(--brand-500) px-4 py-3 font-ui text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-60 dark:bg-(--brand-500) dark:hover:bg-[#d9522d]"
        >
          {generateMutation.isPending ? 'Generating...' : 'Generate test'}
        </button>

        {generateMutation.error && (
          <p className="text-xs text-(--brand-500) dark:text-(--brand-500)">
            {getUserFacingError(generateMutation.error, 'Unable to generate the mock test. Please try again.')}
          </p>
        )}
      </div>
    </div>
  )
}

export default GenerateMockTestPanel

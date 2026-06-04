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
    <div className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]">
      {/* header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[#b84c2b] dark:text-[#e8816a]">
          <SparklesIcon />
        </span>

        <h3 className="font-['Playfair_Display',serif] text-[17px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
          Generate AI mock test
        </h3>
      </div>

      <div className="space-y-3">
        {/* topic input */}
        <input
          value={generateDraft.topic}
          onChange={(e) => updateGenerateDraft({ topic: e.target.value })}
          placeholder="Topic, e.g. Recursion"
          className="w-full rounded-xl border border-[#e0d0c5] bg-[#f5ede4] px-4 py-3 text-sm text-[#1a1714] outline-none transition placeholder:text-[#9b8f87] focus:border-[#b84c2b] focus:bg-[#fdf8f5] dark:border-white/10 dark:bg-[#141412] dark:text-[#f2f0eb] dark:placeholder:text-[#6b6560] dark:focus:border-[#e8816a]"
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
            className="rounded-xl border border-[#e0d0c5] bg-[#f5ede4] px-3 py-3 text-sm text-[#1a1714] outline-none transition focus:border-[#b84c2b] focus:bg-[#fdf8f5] dark:border-white/10 dark:bg-[#141412] dark:text-[#f2f0eb] dark:focus:border-[#e8816a]"
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
            className="rounded-xl border border-[#e0d0c5] bg-[#f5ede4] px-3 py-3 text-sm text-[#1a1714] outline-none transition focus:border-[#b84c2b] focus:bg-[#fdf8f5] dark:border-white/10 dark:bg-[#141412] dark:text-[#f2f0eb] dark:focus:border-[#e8816a]"
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
                  'rounded-full border px-3 py-1.5 font-["DM_Mono",monospace] text-[10px] font-bold capitalize tracking-[0.08em] transition hover:-translate-y-px',
                  isSelected
                    ? 'border-[#b84c2b] bg-[#b84c2b] text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] dark:border-[#e8816a] dark:bg-[#e8816a] dark:text-white'
                    : 'border-[#e0d0c5] bg-white/35 text-[#6b5f58] hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/10 dark:bg-transparent dark:text-[#9b9a92] dark:hover:border-white/20 dark:hover:text-[#f2f0eb]'
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
          className="w-full rounded-xl bg-[#b84c2b] px-4 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e8816a] dark:hover:bg-[#d9522d]"
        >
          {generateMutation.isPending ? 'Generating...' : 'Generate test'}
        </button>

        {generateMutation.error && (
          <p className="text-xs text-[#b84c2b] dark:text-[#e8816a]">
            {generateMutation.error.message}
          </p>
        )}
      </div>
    </div>
  )
}

export default GenerateMockTestPanel
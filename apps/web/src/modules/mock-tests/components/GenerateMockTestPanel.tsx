// ============================================================
// GenerateMockTestPanel.tsx — aligned with Trackers card style
// ============================================================
import { DIFFICULTY_OPTIONS, QUESTION_TYPE_OPTIONS } from '../constants/mock-tests.constants'
import { useGenerateMockTest } from '../hooks/useMockTests'
import { useMockTestsStore } from '../store/mockTests.store'
import { cn } from '../utils/mock-tests-formatters'
import { SparklesIcon } from './MockTestIcons'
import type { QuestionType } from '../types/mock-tests.types'

export function GenerateMockTestPanel() {
  const { generateDraft, updateGenerateDraft, resetGenerateDraft } = useMockTestsStore()
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
    <div className="rounded-[16px] border border-white/10 bg-[#1c1a18] p-5">
      {/* header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[#e8816a]">
          <SparklesIcon />
        </span>
        <h3 className="font-['Playfair_Display',serif] text-[17px] font-[900] text-[#f2f0eb]">
          Generate AI mock test
        </h3>
      </div>

      <div className="space-y-3">
        {/* topic input */}
        <input
          value={generateDraft.topic}
          onChange={(e) => updateGenerateDraft({ topic: e.target.value })}
          placeholder="Topic, e.g. Recursion"
          className="w-full rounded-[12px] border border-white/10 bg-[#141412] px-4 py-3 text-sm text-[#f2f0eb] outline-none placeholder:text-[#6b6560] transition focus:border-[#e8816a]"
        />

        {/* difficulty + count row */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={generateDraft.difficulty}
            onChange={(e) => updateGenerateDraft({ difficulty: e.target.value as any })}
            className="rounded-[12px] border border-white/10 bg-[#141412] px-3 py-3 text-sm text-[#f2f0eb] outline-none transition focus:border-[#e8816a]"
          >
            {DIFFICULTY_OPTIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            max={50}
            value={generateDraft.questionCount}
            onChange={(e) => updateGenerateDraft({ questionCount: Number(e.target.value) })}
            className="rounded-[12px] border border-white/10 bg-[#141412] px-3 py-3 text-sm text-[#f2f0eb] outline-none transition focus:border-[#e8816a]"
          />
        </div>

        {/* question type chips */}
        <div className="flex flex-wrap gap-2">
          {QUESTION_TYPE_OPTIONS.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={cn(
                'rounded-full border px-3 py-1.5 font-["DM_Mono",monospace] text-[10px] font-bold capitalize uppercase tracking-[0.08em] transition hover:-translate-y-px',
                generateDraft.questionTypes.includes(type)
                  ? 'border-[#e8816a] bg-[#e8816a] text-white'
                  : 'border-white/10 text-[#9b9a92] hover:border-white/20 hover:text-[#f2f0eb]'
              )}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* submit */}
        <button
          type="button"
          onClick={submit}
          disabled={generateMutation.isPending || !generateDraft.topic.trim()}
          className="w-full rounded-[12px] bg-[#e8816a] px-4 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-[#d9522d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generateMutation.isPending ? 'Generating...' : 'Generate test'}
        </button>

        {generateMutation.error && (
          <p className="text-xs text-[#e8816a]">
            {generateMutation.error.message}
          </p>
        )}
      </div>
    </div>
  )
}

export default GenerateMockTestPanel
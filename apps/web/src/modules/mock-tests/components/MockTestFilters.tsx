// ============================================================
// MockTestFilters.tsx — aligned with Trackers filter bar style
// ============================================================

import { MOCK_TEST_FILTERS } from '../constants/mock-tests.constants'
import { useMockTestsStore } from '../store/mockTests.store'
import { cn } from '../utils/mock-tests-formatters'

export function MockTestFilters() {
  const { filter, setFilter, search, setSearch } = useMockTestsStore()

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-3 shadow-[0_2px_16px_rgba(26,23,20,0.06)] lg:flex-row lg:items-center lg:justify-between dark:border-white/10 dark:bg-[#1c1a18]">
      {/* filter pills — rust active in light, coral active in dark */}
      <div className="flex flex-wrap gap-1.5">
        {MOCK_TEST_FILTERS.map((item) => {
          const isActive = filter === item

          return (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "rounded-full px-4 py-2 font-['DM_Mono',monospace] text-[11px] font-bold uppercase tracking-[0.08em] transition hover:-translate-y-px",
                isActive
                  ? 'bg-[#b84c2b] text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] dark:bg-[#e8816a]'
                  : 'text-[#6b5f58] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:bg-transparent dark:hover:text-[#f2f0eb]'
              )}
            >
              {item}
            </button>
          )
        })}
      </div>

      {/* search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search mock tests..."
        className="min-w-0 rounded-xl border border-[#e0d0c5] bg-[#f5ede4] px-4 py-2.5 text-sm text-[#1a1714] outline-none transition placeholder:text-[#9b8f87] focus:border-[#b84c2b] focus:bg-[#fdf8f5] lg:w-72 dark:border-white/10 dark:bg-[#141412] dark:text-[#f2f0eb] dark:placeholder:text-[#6b6560] dark:focus:border-[#e8816a]"
      />
    </div>
  )
}

export default MockTestFilters
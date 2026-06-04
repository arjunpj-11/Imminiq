// ============================================================
// MockTestFilters.tsx — aligned with Trackers filter bar style
// ============================================================
import { MOCK_TEST_FILTERS } from '../constants/mock-tests.constants'
import { useMockTestsStore } from '../store/mockTests.store'
import { cn } from '../utils/mock-tests-formatters'

export function MockTestFilters() {
  const { filter, setFilter, search, setSearch } = useMockTestsStore()

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#1c1a18] p-3 lg:flex-row lg:items-center lg:justify-between">
      {/* filter pills — coral active, matching Trackers */}
      <div className="flex flex-wrap gap-1.5">
        {MOCK_TEST_FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "rounded-full px-4 py-2 font-['DM_Mono',monospace] text-[11px] font-bold uppercase tracking-[0.08em] transition hover:-translate-y-px",
              filter === item
                ? 'bg-[#e8816a] text-white'
                : 'text-[#9b9a92] hover:text-[#f2f0eb]'
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {/* search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search mock tests..."
        className="min-w-0 rounded-xl border border-white/10 bg-[#141412] px-4 py-2.5 text-sm text-[#f2f0eb] outline-none placeholder:text-[#6b6560] transition focus:border-[#e8816a] lg:w-72"
      />
    </div>
  )
}

export default MockTestFilters
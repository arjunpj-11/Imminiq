import FilterBar from '../../../../components/filters/FilterBar'
import SearchInput from '../../../../components/filters/SearchInput'
import PillTabs from '../../../../components/navigation/PillTabs'
import { MOCK_TEST_FILTERS } from '../constants/mock-tests.constants'
import { useMockTestSearchState } from '../hooks/useMockTestSearchState'

export function MockTestFilters() {
  const { filter, setFilter, search, setSearch } = useMockTestSearchState()

  return (
    <FilterBar
      surface
      className="flex-col shadow-(--shadow-1) lg:flex-row lg:justify-between"
    >
      <PillTabs
        value={filter}
        onValueChange={setFilter}
        ariaLabel="Mock test status"
        className="border-0 bg-transparent p-0 dark:bg-transparent"
        itemClassName="rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.08em]"
        items={MOCK_TEST_FILTERS.map((item) => ({
          value: item,
          label: item,
        }))}
      />

      <SearchInput
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onClear={() => setSearch('')}
        placeholder="Search mock tests..."
        containerClassName="w-full flex-none lg:w-72"
        className="bg-(--surface-canvas) py-2.5 dark:bg-(--surface-canvas)"
      />
    </FilterBar>
  )
}

export default MockTestFilters

import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  MOCK_TEST_FILTERS,
  type MockTestFilter,
} from '../constants/mock-tests.constants'

const parseFilter = (value: string | null): MockTestFilter =>
  MOCK_TEST_FILTERS.find((filter) => filter === value) ?? 'All'

export function useMockTestSearchState() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = parseFilter(searchParams.get('filter'))
  const search = searchParams.get('q') ?? ''

  const updateParam = useCallback(
    (key: 'filter' | 'q', value: string, defaultValue = '') => {
      const nextParams = new URLSearchParams(searchParams)

      if (!value || value === defaultValue) nextParams.delete(key)
      else nextParams.set(key, value)

      nextParams.delete('page')
      setSearchParams(nextParams, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  return {
    filter,
    search,
    setFilter: (value: MockTestFilter) => updateParam('filter', value, 'All'),
    setSearch: (value: string) => updateParam('q', value),
  }
}

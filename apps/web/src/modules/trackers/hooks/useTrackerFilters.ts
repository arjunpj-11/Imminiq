import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { TrackerStatusFilter } from '../types/tracker.types'

const VALID_STATUSES = new Set<TrackerStatusFilter>([
  'all',
  'active',
  'stalled',
  'completed',
  'archived',
])

export function useTrackerFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const status = useMemo<TrackerStatusFilter>(() => {
    const value = searchParams.get('status') as TrackerStatusFilter | null
    return value && VALID_STATUSES.has(value) ? value : 'all'
  }, [searchParams])

  return {
    status,
    setStatus: (nextStatus: TrackerStatusFilter) => {
      const next = new URLSearchParams(searchParams)
      if (nextStatus === 'all') next.delete('status')
      else next.set('status', nextStatus)
      setSearchParams(next, { replace: false })
    },
  }
}

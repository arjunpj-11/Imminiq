import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { TrackerStatusFilter } from '../types/tracker.types';

const VALID_STATUSES = new Set<TrackerStatusFilter>([
  'all',
  'active',
  'stalled',
  'completed',
  'archived',
]);

export function useTrackerFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = useMemo<TrackerStatusFilter>(() => {
    const value = searchParams.get('status') as TrackerStatusFilter | null;
    return value && VALID_STATUSES.has(value) ? value : 'all';
  }, [searchParams]);
  const search = searchParams.get('search') ?? '';
  const parsedPage = Number(searchParams.get('page') ?? '1');
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const update = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    mutate(next);
    setSearchParams(next, { replace: false });
  };

  return {
    status,
    search,
    page,
    setStatus: (nextStatus: TrackerStatusFilter) => {
      update((next) => {
        if (nextStatus === 'all') next.delete('status');
        else next.set('status', nextStatus);
        next.delete('page');
      });
    },
    setSearch: (value: string) => {
      update((next) => {
        const normalized = value.slice(0, 120);
        if (normalized) next.set('search', normalized);
        else next.delete('search');
        next.delete('page');
      });
    },
    setPage: (nextPage: number) => {
      update((next) => {
        if (nextPage <= 1) next.delete('page');
        else next.set('page', String(nextPage));
      });
    },
  };
}

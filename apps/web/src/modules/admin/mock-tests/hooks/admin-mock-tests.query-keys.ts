import type { AdminListQuery } from '../../shared';

export const adminMockTestsKeys = {
  all: ['admin', 'mock-tests'] as const,
  lists: () => [...adminMockTestsKeys.all, 'list'] as const,
  list: (query: AdminListQuery) => [...adminMockTestsKeys.lists(), query] as const,
  details: () => [...adminMockTestsKeys.all, 'detail'] as const,
  detail: (id?: string) => [...adminMockTestsKeys.details(), id] as const,
  reports: () => [...adminMockTestsKeys.all, 'reports'] as const,
  reportList: (query: AdminListQuery) => [...adminMockTestsKeys.reports(), query] as const,
  versions: (questionId?: string) =>
    [...adminMockTestsKeys.all, 'question-versions', questionId] as const,
};

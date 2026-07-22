export type AdminFeatureKind = 'users' | 'trackers' | 'mock-tests';
export type AdminContentKind = Exclude<AdminFeatureKind, 'users'>;

export const adminSharedKeys = {
  all: ['admin'] as const,
  feature: (kind: AdminFeatureKind) => [...adminSharedKeys.all, kind] as const,
  contentAppeals: (kind: AdminContentKind) =>
    [...adminSharedKeys.feature(kind), 'content-appeals'] as const,
  contentAppealList: (kind: AdminContentKind, status: string, page: number) =>
    [...adminSharedKeys.contentAppeals(kind), { status, page }] as const,
};

import type { AdminListQuery } from '../domain/admin-shared.types';

export const adminListOffset = (query: AdminListQuery) => (query.page - 1) * query.limit;

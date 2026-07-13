import type { AdminListQuery, AdminPage } from '../domain/admin-shared.types'

export const escapeAdminSearch = (value = '') =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const createAdminPage = <T>(
  items: T[],
  query: AdminListQuery,
  total: number,
  stats?: Record<string, number>,
): AdminPage<T> => ({
  items,
  pagination: {
    page: query.page,
    limit: query.limit,
    total,
    pages: Math.max(1, Math.ceil(total / query.limit)),
  },
  ...(stats ? { stats } : {}),
})

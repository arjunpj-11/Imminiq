export type AdminUsersQuery = {
  search?: string
  status?: 'all' | 'active' | 'blocked'
  page?: number
}

export const adminUsersKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUsersKeys.all, 'list'] as const,
  list: (query: AdminUsersQuery) => [...adminUsersKeys.lists(), query] as const,
  details: () => [...adminUsersKeys.all, 'detail'] as const,
  detail: (userId: string) => [...adminUsersKeys.details(), userId] as const,
}

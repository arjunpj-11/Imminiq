import { useQuery } from '@tanstack/react-query'

import api from '../../../../lib/axios'
import { ADMIN_USERS_STALE_TIME_MS } from '../constants/admin-users.constants'
import type { AdminUserDetailData } from '../types/admin-users.types'
import { adminUsersKeys } from './admin-users.query-keys'

type ApiResponse<T> = { data: T }

export const useAdminUserDetail = (userId: string) => useQuery({
  queryKey: adminUsersKeys.detail(userId),
  queryFn: async () =>
    (await api.get<ApiResponse<AdminUserDetailData>>(`/admin/users/${userId}`)).data.data,
  enabled: Boolean(userId),
  staleTime: ADMIN_USERS_STALE_TIME_MS,
})

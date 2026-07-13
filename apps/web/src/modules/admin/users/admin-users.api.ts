import api from '../../../lib/axios'
import type { AdminUserDetailData, AdminUsersData } from './admin-users.types'

type ApiEnvelope<T> = { data: T }
export const getAdminUsers = async (params: { search?: string; status?: string; page?: number }) =>
  (await api.get<ApiEnvelope<AdminUsersData>>('/admin/users', { params })).data.data
export const getAdminUser = async (userId: string) =>
  (await api.get<ApiEnvelope<AdminUserDetailData>>(`/admin/users/${userId}`)).data.data
export const setAdminUserStatus = async (userId: string, status: 'active' | 'blocked') =>
  (await api.patch(`/admin/users/${userId}/status`, { status })).data

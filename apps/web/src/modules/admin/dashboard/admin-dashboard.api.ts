import api from '../../../lib/axios'
import type { AdminDashboardData } from './admin-dashboard.types'

type ApiEnvelope<T> = { data: T }
export const getAdminDashboard = async () =>
  (await api.get<ApiEnvelope<AdminDashboardData>>('/admin/dashboard')).data.data

import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../../../lib/api.types';
import { ADMIN_TRACKERS_ENDPOINTS } from '../constants/admin-trackers.constants';
import type { AdminTrackerVersion } from '../types/admin-trackers.types';
import { adminTrackersKeys } from './admin-trackers.query-keys';
export const useAdminTrackerVersions = (id?: string) => useQuery({ queryKey: adminTrackersKeys.versions(id), enabled: Boolean(id), queryFn: async () => (await api.get<ApiEnvelope<AdminTrackerVersion[]>>(ADMIN_TRACKERS_ENDPOINTS.versions(id ?? ''))).data.data });

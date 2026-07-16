import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { ADMIN_USERS_ENDPOINTS } from '../constants/admin-users.constants';
import { adminUsersKeys } from './admin-users.query-keys';
export const useUpdateAdminPrivacyRequest = () => { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, status, resolutionNote, downloadUrl, mfaCode }: { id: string; status: 'in_progress' | 'completed' | 'rejected'; resolutionNote: string; downloadUrl?: string; mfaCode?: string }) => api.patch(ADMIN_USERS_ENDPOINTS.privacyRequest(id), { status, resolutionNote, downloadUrl: downloadUrl || undefined }, { headers: mfaCode ? { 'X-Admin-MFA-Code': mfaCode } : undefined }), onSuccess: async () => { toast.success('Privacy request updated'); await client.invalidateQueries({ queryKey: adminUsersKeys.privacyRequests() }); }, onError: (error) => toast.error('Update failed', getUserFacingError(error)) }); };

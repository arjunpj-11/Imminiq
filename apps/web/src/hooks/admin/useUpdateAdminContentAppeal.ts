import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ADMIN_CONTENT_APPEALS_ENDPOINTS } from '../../config/admin-shared.constants';
import api from '../../lib/axios';
import { toast } from '../../lib/toast';
import { getUserFacingError } from '../../lib/user-facing-error';
import { adminSharedKeys, type AdminContentKind } from './admin-shared.query-keys';
import type { AdminContentAppealDecision } from './admin-shared.types';

export const useUpdateAdminContentAppeal = (kind: AdminContentKind) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, decisionStatus, decisionNote, actionPassword }: AdminContentAppealDecision) => {
      await api.patch(
        ADMIN_CONTENT_APPEALS_ENDPOINTS.detail(kind, id),
        { status: decisionStatus, decisionNote },
        { headers: { 'X-Admin-Action-Password': actionPassword } },
      );
    },
    onSuccess: async () => {
      toast.success('Content appeal updated');
      await queryClient.invalidateQueries({ queryKey: adminSharedKeys.contentAppeals(kind) });
    },
    onError: (error) => toast.error('Appeal update failed', getUserFacingError(error)),
  });
};

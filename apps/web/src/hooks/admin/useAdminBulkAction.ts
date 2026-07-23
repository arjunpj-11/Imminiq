import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ADMIN_BULK_ACTION_ENDPOINTS } from '../../config/admin-shared.constants';
import api from '../../lib/axios';
import { toast } from '../../lib/toast';
import { getUserFacingError } from '../../lib/user-facing-error';
import { adminSharedKeys, type AdminFeatureKind } from './admin-shared.query-keys';

export type AdminBulkAction = 'suspend' | 'delete' | 'restore' | 'block';

interface IAdminBulkActionInput {
  kind: AdminFeatureKind;
  selected: string[];
  action: AdminBulkAction;
  reason: string;
  actionPassword: string;
  preview: boolean;
}

export type AdminBulkActionResult = {
  eligible?: string[];
  succeeded?: number;
  failed?: number;
};

export const useAdminBulkAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      kind,
      selected,
      action,
      reason,
      actionPassword,
      preview,
    }: IAdminBulkActionInput) => {
      const body =
        kind === 'users'
          ? {
              userIds: selected,
              status:
                action === 'block' || action === 'restore'
                  ? action === 'restore'
                    ? 'active'
                    : 'blocked'
                  : 'paused',
              reasonCode: action === 'restore' ? 'appeal_accepted' : 'other',
              reason,
              notifyEmail: true,
              preview,
            }
          : {
              ids: selected,
              action: action === 'block' ? 'suspend' : action,
              reasonCode: action === 'restore' ? 'appeal_accepted' : 'other',
              reason,
              notifyOwner: true,
              preview,
            };

      return (
        await api.post(ADMIN_BULK_ACTION_ENDPOINTS[kind], body, {
          headers: actionPassword ? { 'X-Admin-Action-Password': actionPassword } : undefined,
        })
      ).data.data as AdminBulkActionResult;
    },
    onSuccess: async (_data, variables) => {
      if (!variables.preview) {
        await queryClient.invalidateQueries({
          queryKey: adminSharedKeys.feature(variables.kind),
        });
      }
    },
    onError: (error) => toast.error('Bulk action failed', getUserFacingError(error)),
  });
};

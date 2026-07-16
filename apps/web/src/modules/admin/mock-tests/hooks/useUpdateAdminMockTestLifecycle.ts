import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { ADMIN_MOCK_TESTS_ENDPOINTS } from '../constants/admin-mock-tests.constants';
import type { AdminMockTestLifecyclePayload } from '../types/admin-mock-tests.types';
import { adminMockTestsKeys } from './admin-mock-tests.query-keys';

export const useUpdateAdminMockTestLifecycle = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminMockTestLifecyclePayload }) =>
      api.patch(ADMIN_MOCK_TESTS_ENDPOINTS.lifecycle(id), payload),
    onSuccess: async (_response, variables) => {
      toast.success(
        'Mock test updated',
        variables.payload.notifyOwner
          ? 'The owner received an in-app notification and an email was queued.'
          : 'The owner received an in-app notification.'
      );
      await client.invalidateQueries({ queryKey: adminMockTestsKeys.all });
    },
    onError: (error) => toast.error('Mock test update failed', getUserFacingError(error)),
  });
};

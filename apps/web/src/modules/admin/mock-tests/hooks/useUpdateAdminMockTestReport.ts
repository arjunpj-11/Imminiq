import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { ADMIN_MOCK_TESTS_ENDPOINTS } from '../constants/admin-mock-tests.constants';
import type { AdminMockTestIssueUpdatePayload } from '../types/admin-mock-tests.types';
import { adminMockTestsKeys } from './admin-mock-tests.query-keys';

export const useUpdateAdminMockTestReport = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminMockTestIssueUpdatePayload }) => {
      const { mfaCode, ...body } = payload;
      return api.patch(ADMIN_MOCK_TESTS_ENDPOINTS.report(id), body, {
        headers: mfaCode ? { 'X-Admin-MFA-Code': mfaCode } : undefined,
      });
    },
    onSuccess: async () => {
      toast.success('Report updated', 'The reporter was notified in the app.');
      await client.invalidateQueries({ queryKey: adminMockTestsKeys.all });
    },
    onError: (error) => toast.error('Could not update report', getUserFacingError(error)),
  });
};

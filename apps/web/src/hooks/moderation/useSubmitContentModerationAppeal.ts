import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../lib/axios';
import { MODERATION_APPEAL_ENDPOINTS } from './moderation.constants';
import { moderationKeys } from './moderation.query-keys';
import type { ISubmitContentModerationAppealPayload } from './moderation.types';

export const useSubmitContentModerationAppeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ISubmitContentModerationAppealPayload) => {
      await api.post(MODERATION_APPEAL_ENDPOINTS.content, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: moderationKeys.content() });
    },
  });
};

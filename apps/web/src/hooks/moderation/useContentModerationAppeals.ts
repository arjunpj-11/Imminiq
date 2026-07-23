import { useQuery } from '@tanstack/react-query';

import api from '../../lib/axios';
import type { ApiEnvelope } from '../../lib/api.types';
import { MODERATION_APPEAL_ENDPOINTS } from './moderation.constants';
import { moderationKeys } from './moderation.query-keys';
import type { ContentModerationAppeal } from './moderation.types';

export const useContentModerationAppeals = () =>
  useQuery({
    queryKey: moderationKeys.content(),
    queryFn: async () =>
      (await api.get<ApiEnvelope<ContentModerationAppeal[]>>(MODERATION_APPEAL_ENDPOINTS.content))
        .data.data,
  });

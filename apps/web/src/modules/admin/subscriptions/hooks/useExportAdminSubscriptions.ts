import { useMutation } from '@tanstack/react-query';

import { paginationConfig } from '../../../../config/pagination';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../../../lib/api.types';
import { ADMIN_SUBSCRIPTIONS_ENDPOINTS } from '../constants/admin-subscriptions.constants';
import type {
  AdminSubscriptionItem,
  AdminSubscriptionOverview,
} from '../types/admin-subscriptions.types';

interface IExportAdminSubscriptionsInput {
  search: string;
  status: string;
}

export const useExportAdminSubscriptions = () =>
  useMutation({
    mutationFn: async ({ search, status }: IExportAdminSubscriptionsInput) => {
      const rows: AdminSubscriptionItem[] = [];
      let nextPage = 1;
      while (true) {
        const response = await api.get<ApiEnvelope<AdminSubscriptionOverview>>(
          ADMIN_SUBSCRIPTIONS_ENDPOINTS.overview,
          {
            params: {
              search: search || undefined,
              status,
              page: nextPage,
              limit: paginationConfig.batchLimit,
            },
          }
        );
        rows.push(...response.data.data.subscriptions.items);
        const pages = response.data.data.subscriptions.pagination.pages;
        if (nextPage >= pages) break;
        nextPage += 1;
      }

      return rows;
    },
  });

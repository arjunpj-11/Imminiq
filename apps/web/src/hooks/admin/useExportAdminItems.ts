import { useMutation } from '@tanstack/react-query';

import {
  fetchAllAdminItems,
  type FetchAllAdminItemsOptions,
} from '../../lib/admin/fetchAllAdminItems';

export const useExportAdminItems = <TData, TItem>() =>
  useMutation({
    mutationFn: (options: FetchAllAdminItemsOptions<TData, TItem>) =>
      fetchAllAdminItems(options),
  });

import api from "../../../../lib/axios";
import type { ApiEnvelope } from "../../../../lib/api.types";

type ExportQueryValue = string | number | boolean | null | undefined;

type FetchAllAdminItemsOptions<TData, TItem> = {
  endpoint: string;
  params?: Record<string, ExportQueryValue>;
  selectItems: (data: TData) => TItem[];
  selectPageCount: (data: TData) => number;
  pageSize?: number;
  maxPages?: number;
};

/**
 * Loads every page matching the active admin filters for a client-generated
 * report. The upper bound prevents a malformed pagination response from
 * creating an endless export loop.
 */
export async function fetchAllAdminItems<TData, TItem>({
  endpoint,
  params,
  selectItems,
  selectPageCount,
  pageSize = 50,
  maxPages = 500,
}: FetchAllAdminItemsOptions<TData, TItem>): Promise<TItem[]> {
  const items: TItem[] = [];
  let page = 1;
  // eslint-disable-next-line no-useless-assignment -- pages is used in the while condition
  let pages = 1;

  do {
    const response = await api.get<ApiEnvelope<TData>>(endpoint, {
      params: {
        ...params,
        page,
        limit: pageSize,
      },
    });
    const data = response.data.data;
    items.push(...selectItems(data));
    pages = Math.max(1, Math.floor(selectPageCount(data) || 1));
    page += 1;

    if (page > maxPages) {
      throw new Error(
        `The export contains more than ${maxPages * pageSize} records. Use a narrower filter before exporting.`,
      );
    }
  } while (page <= pages);

  return items;
}

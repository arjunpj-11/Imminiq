import api from "../axios";
import type { ApiEnvelope } from "../api.types";

type ExportQueryValue = string | number | boolean | null | undefined;

export type FetchAllAdminItemsOptions<TData, TItem> = {
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
  while (true) {
    const response = await api.get<ApiEnvelope<TData>>(endpoint, {
      params: {
        ...params,
        page,
        limit: pageSize,
      },
    });
    const data = response.data.data;
    items.push(...selectItems(data));
    const pages = Math.max(1, Math.floor(selectPageCount(data) || 1));
    if (page >= pages) break;
    page += 1;

    if (page > maxPages) {
      throw new Error(
        `The export contains more than ${maxPages * pageSize} records. Use a narrower filter before exporting.`,
      );
    }
  }

  return items;
}

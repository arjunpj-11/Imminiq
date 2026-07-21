import type { AdminListQuery } from "../../../../components/admin";

export const adminTrackersKeys = {
  all: ["admin", "trackers"] as const,
  lists: () => [...adminTrackersKeys.all, "list"] as const,
  list: (query: AdminListQuery) =>
    [...adminTrackersKeys.lists(), query] as const,
  details: () => [...adminTrackersKeys.all, "detail"] as const,
  detail: (id?: string) => [...adminTrackersKeys.details(), id] as const,
  published: () => [...adminTrackersKeys.all, "published"] as const,
  publishedList: (query: AdminListQuery) =>
    [...adminTrackersKeys.published(), query] as const,
  reports: () => [...adminTrackersKeys.all, "reports"] as const,
  reportList: (query: AdminListQuery) =>
    [...adminTrackersKeys.reports(), query] as const,
  reviews: () => [...adminTrackersKeys.all, "reviews"] as const,
  reviewList: (query: AdminListQuery) =>
    [...adminTrackersKeys.reviews(), query] as const,
};

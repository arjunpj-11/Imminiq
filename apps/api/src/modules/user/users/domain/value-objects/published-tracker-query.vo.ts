import type { ProfileSort } from './profile-sort.vo';
import type { ProfileTrackerStatus } from './profile-tracker-status.vo';

export type PublishedTrackerQuery = {
  page: number;
  limit: number;
  search?: string;
  status?: ProfileTrackerStatus;
  sort?: ProfileSort;
};

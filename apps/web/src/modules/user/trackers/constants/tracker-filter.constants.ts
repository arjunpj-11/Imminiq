import type { TrackerStatusFilter } from '../types/tracker.types';

export const trackerFilterStatusOptions: Array<{
  label: string;
  value: TrackerStatusFilter;
}> = [
  { label: 'All Trackers', value: 'all' },
  { label: 'In Progress', value: 'active' },
  { label: 'Stalled', value: 'stalled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived', value: 'archived' },
];

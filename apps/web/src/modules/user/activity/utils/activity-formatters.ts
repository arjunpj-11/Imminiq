import { ACTIVITY_MIN_YEAR } from '../constants/activity.constants';
import type {
  ActivityFeedFilter,
  IActivityFeedGroup,
  IActivityFeedResponse,
} from '../types/activity.types';

const VALID_FILTERS = new Set<ActivityFeedFilter>(['all', 'trackers', 'mock_tests', 'community']);

export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'IM';

export const formatLevelLabel = (isPremium: boolean): string =>
  isPremium ? 'Imminiq Pro' : 'Free Scholar';

export const formatCompactNumber = (value: number): string => {
  const normalized = Number.isFinite(value) ? Math.max(0, value) : 0;

  if (normalized < 1_000) {
    return normalized.toLocaleString();
  }

  if (normalized < 1_000_000) {
    const compact = normalized / 1_000;
    return `${compact.toFixed(normalized % 1_000 === 0 ? 0 : 1)}k`;
  }

  const compact = normalized / 1_000_000;
  return `${compact.toFixed(normalized % 1_000_000 === 0 ? 0 : 1)}m`;
};

export const formatNumber = (value: number): string =>
  Math.max(0, Number.isFinite(value) ? value : 0).toLocaleString();

export const formatPercent = (value: number): string =>
  `${Math.round(Number.isFinite(value) ? value : 0)}%`;

export const formatSignedPercent = (value: number): string => {
  const rounded = Math.round(Number.isFinite(value) ? value : 0);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
};

export const parseActivityFilter = (value: string | null): ActivityFeedFilter =>
  value && VALID_FILTERS.has(value as ActivityFeedFilter) ? (value as ActivityFeedFilter) : 'all';

export const parseActivityYear = (value: string | null): number => {
  const currentYear = new Date().getFullYear();
  const parsed = Number(value);

  if (Number.isInteger(parsed) && parsed >= ACTIVITY_MIN_YEAR && parsed <= currentYear) {
    return parsed;
  }

  return currentYear;
};

export const getBrowserUtcOffsetMinutes = (): number => -new Date().getTimezoneOffset();

export const resolveAccountStartYear = (accountCreatedAt?: string | Date | null): number => {
  const currentYear = new Date().getFullYear();

  if (!accountCreatedAt) {
    return currentYear;
  }

  const accountDate = new Date(accountCreatedAt);

  if (Number.isNaN(accountDate.getTime())) {
    return currentYear;
  }

  return Math.min(Math.max(accountDate.getFullYear(), ACTIVITY_MIN_YEAR), currentYear);
};

export const buildActivityYearOptions = (accountCreatedAt?: string | Date | null): number[] => {
  const currentYear = new Date().getFullYear();
  const startYear = resolveAccountStartYear(accountCreatedAt);

  return Array.from({ length: currentYear - startYear + 1 }, (_, index) => currentYear - index);
};

export const formatActivityTimestamp = (occurredAt: string, now = new Date()): string => {
  const date = new Date(occurredAt);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60_000));

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  const nowDateKey = toLocalDateKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (toLocalDateKey(date) === toLocalDateKey(yesterday)) {
    return `Yesterday, ${time}`;
  }

  if (toLocalDateKey(date) === nowDateKey) {
    return time;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const mergeActivityFeedPages = (pages: IActivityFeedResponse[]): IActivityFeedGroup[] => {
  const groupOrder: string[] = [];
  const groups = new Map<string, IActivityFeedGroup>();
  const seenEventIds = new Set<string>();

  for (const page of pages) {
    for (const group of page.groups) {
      const existing = groups.get(group.date);

      if (!existing) {
        groupOrder.push(group.date);
        groups.set(group.date, {
          date: group.date,
          label: group.label,
          events: [],
        });
      }

      const target = groups.get(group.date);

      if (!target) {
        continue;
      }

      for (const event of group.events) {
        if (seenEventIds.has(event.id)) {
          continue;
        }

        seenEventIds.add(event.id);
        target.events.push(event);
      }
    }
  }

  return groupOrder
    .map((date) => groups.get(date))
    .filter((group): group is IActivityFeedGroup => Boolean(group))
    .filter((group) => group.events.length > 0);
};

const toLocalDateKey = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export function formatProfileLevel(level: number | undefined) {
  const safeLevel = Math.max(0, Number(level ?? 0));

  const title =
    safeLevel >= 30
      ? 'Master'
      : safeLevel >= 20
        ? 'Expert'
        : safeLevel >= 10
          ? 'Adept'
          : safeLevel >= 5
            ? 'Builder'
            : 'Starter';

  return `Level ${safeLevel} · ${title}`;
}

export const formatCompactNumber = (value: number | string | null | undefined) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return '0';

  return new Intl.NumberFormat(undefined, {
    notation: numeric >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: numeric >= 1000 ? 1 : 0,
  }).format(numeric);
};

export const formatRelativeTime = (value: string | Date) => {
  const date = new Date(value);
  const time = date.getTime();
  if (Number.isNaN(time)) return 'Recently';

  const diffMs = Date.now() - time;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

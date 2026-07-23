const RECENT_WEEKDAY_WINDOW_DAYS = 7;

const startOfLocalDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

export const getChatDateLabel = (value: string | Date, now = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const day = startOfLocalDay(date);
  const today = startOfLocalDay(now);
  const differenceInDays = Math.round((today.getTime() - day.getTime()) / 86_400_000);

  if (differenceInDays === 0) return 'Today';
  if (differenceInDays === 1) return 'Yesterday';
  if (differenceInDays > 1 && differenceInDays < RECENT_WEEKDAY_WINDOW_DAYS) {
    return date.toLocaleDateString([], { weekday: 'long' });
  }
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
};

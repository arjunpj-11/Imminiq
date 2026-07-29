export const boundedInteger = (value: string | number, min: number, max: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
};

export const normalizePercentage = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  const parsedFallback = Number(fallback);
  const finiteValue = Number.isFinite(parsed)
    ? parsed
    : Number.isFinite(parsedFallback)
      ? parsedFallback
      : 0;

  return Math.min(100, Math.max(0, Math.round(finiteValue)));
};

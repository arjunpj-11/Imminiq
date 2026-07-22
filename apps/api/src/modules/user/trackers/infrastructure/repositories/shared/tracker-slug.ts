export const createUniqueTrackerSlug = (title: string, id: string): string => {
  const base =
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'tracker';
  const suffix = id.slice(-8).toLowerCase();

  return `${base.slice(0, 111)}-${suffix}`;
};

export const ACTIVITY_XP_BUCKETS = ['learning', 'teacher', 'none'] as const;

export type ActivityXpBucket = (typeof ACTIVITY_XP_BUCKETS)[number];

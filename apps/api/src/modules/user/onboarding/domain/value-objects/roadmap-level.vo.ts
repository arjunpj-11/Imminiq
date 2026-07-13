export const ROADMAP_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
] as const

export type RoadmapLevel = (typeof ROADMAP_LEVELS)[number]

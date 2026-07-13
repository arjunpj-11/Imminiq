export const AI_GENERATION_JOB_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
] as const

export type AIGenerationJobStatus =
  (typeof AI_GENERATION_JOB_STATUSES)[number]

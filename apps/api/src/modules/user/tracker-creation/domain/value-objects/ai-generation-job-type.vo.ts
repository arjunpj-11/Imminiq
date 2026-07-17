export const AI_GENERATION_JOB_TYPES = ['roadmap', 'evaluation'] as const;

export type AIGenerationJobType = (typeof AI_GENERATION_JOB_TYPES)[number];

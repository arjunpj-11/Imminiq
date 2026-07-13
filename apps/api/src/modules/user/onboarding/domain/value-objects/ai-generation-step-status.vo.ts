export const AI_GENERATION_STEP_STATUSES = ['pending', 'active', 'completed', 'failed'] as const;

export type AIGenerationStepStatus = (typeof AI_GENERATION_STEP_STATUSES)[number];

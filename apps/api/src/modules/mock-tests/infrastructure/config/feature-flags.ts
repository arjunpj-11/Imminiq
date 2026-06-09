// infrastructure/config/feature-flags.ts
/**
 * When true  → generate questions via AI and seed the question bank.
 * When false → serve questions sampled from the existing question bank.
 * Change this one line when you're ready to switch modes.
 */
export const USE_AI_GENERATION = true
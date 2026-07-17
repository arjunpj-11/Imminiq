export const ROADMAP_GENERATION_TOTAL_STEPS = 5;
export const ROADMAP_EVALUATION_TOTAL_STEPS = 5;

export const ROADMAP_GENERATION_STEPS = [
  'Analysing your learning goal',
  'Mapping the main roadmap areas',
  'Building the nested topic structure',
  'Saving your roadmap',
  'Finalising',
] as const;

export const ROADMAP_EVALUATION_STEPS = [
  'Loading your generated roadmap',
  'Reviewing roadmap structure and coverage',
  'Scoring roadmap quality with Gemini',
  'Preparing gaps, strengths, and suggestions',
  'Finalising evaluation report',
] as const;

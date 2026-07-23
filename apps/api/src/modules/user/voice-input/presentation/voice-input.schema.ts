import { z } from 'zod';

export const transcribeVoiceInputSchema = z.object({
  language: z.string().trim().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/).optional(),
});

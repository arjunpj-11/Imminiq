import { z } from 'zod';

const topicSchema = z
  .string()
  .trim()
  .min(2, 'Topic is required')
  .max(200, 'Topic must be 200 characters or fewer');

const goalSchema = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}, z.string().max(400, 'Goal must be 400 characters or fewer').optional());

const roadmapLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);

const preferredLanguageSchema = z
  .string()
  .trim()
  .min(2, 'Preferred language is required')
  .max(80, 'Preferred language must be 80 characters or fewer')
  .default('English');

export const step1Schema = z.object({
  topic: topicSchema,
  goal: goalSchema,
  preferredLanguage: preferredLanguageSchema,
});

export const trackerIntakeSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['assistant', 'user']),
        content: z.string().trim().min(1).max(1500),
      })
    )
    .min(2)
    .max(16),
});

export const step2Schema = z.object({
  level: roadmapLevelSchema,
});

export const generateRoadmapSchema = z.object({
  topic: topicSchema,
  goal: goalSchema,
  level: roadmapLevelSchema,
  preferredLanguage: preferredLanguageSchema,
});

export type Step1Input = z.infer<typeof step1Schema>;

export type Step2Input = z.infer<typeof step2Schema>;

export type GenerateRoadmapInput = z.infer<typeof generateRoadmapSchema>;

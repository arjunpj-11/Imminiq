import { z } from 'zod'

export const step1Schema = z.object({
  topic: z
    .string()
    .trim()
    .min(2, 'Topic is required')
    .max(200, 'Topic must be 200 characters or fewer'),

  goal: z
    .string()
    .trim()
    .max(400, 'Goal must be 400 characters or fewer')
    .optional(),
})

export const step2Schema = z.object({
  level: z.enum([
    'beginner',
    'intermediate',
    'advanced',
  ]),
})

export const generateRoadmapSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(2, 'Topic is required')
    .max(200, 'Topic must be 200 characters or fewer'),

  goal: z
    .string()
    .trim()
    .max(400, 'Goal must be 400 characters or fewer')
    .optional(),

  level: z.enum([
    'beginner',
    'intermediate',
    'advanced',
  ]),
})

export type Step1Payload = z.infer<typeof step1Schema>
export type Step2Payload = z.infer<typeof step2Schema>
export type GenerateRoadmapPayload = z.infer<typeof generateRoadmapSchema>

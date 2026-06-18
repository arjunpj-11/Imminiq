import { z } from 'zod'

const topicSchema = z
  .string()
  .trim()
  .min(2, 'Topic is required')
  .max(200, 'Topic must be 200 characters or fewer')

const goalSchema = z
  .string()
  .trim()
  .max(400, 'Goal must be 400 characters or fewer')
  .optional()

const roadmapLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
])

export const step1Schema = z.object({
  topic: topicSchema,
  goal: goalSchema,
})

export const step2Schema = z.object({
  level: roadmapLevelSchema,
})

export const generateRoadmapSchema = z.object({
  topic: topicSchema,
  goal: goalSchema,
  level: roadmapLevelSchema,
})

export type Step1Input = z.infer<typeof step1Schema>
export type Step2Input = z.infer<typeof step2Schema>
export type GenerateRoadmapInput = z.infer<typeof generateRoadmapSchema>

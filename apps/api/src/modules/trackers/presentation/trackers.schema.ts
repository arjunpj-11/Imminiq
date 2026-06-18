import { z } from 'zod'

export const trackerDomainSchema = z.enum([
  'engineering',
  'frontend',
  'backend',
  'algorithms',
  'architecture',
  'development',
  'design',
  'ai',
  'other',
])

export const trackerListQuerySchema = z.object({
  status: z
    .enum(['all', 'active', 'stalled', 'completed', 'archived'])
    .optional(),
  domain: trackerDomainSchema.or(z.literal('all')).optional(),
  sortBy: z.enum(['lastActive', 'createdAt', 'progress', 'title']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
})

export const createTrackerSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  domain: trackerDomainSchema.optional(),
  goal: z.string().trim().max(500).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  visibility: z.enum(['private', 'public']).optional(),
})

export const updateTrackerSchema = createTrackerSchema.partial()

export const createTopicSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
})

export const createSubtopicSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(700).optional(),
  parentSubtopicId: z.string().optional().nullable(),
  estimatedMinutes: z.coerce.number().int().min(0).optional(),
})

export const updateSubtopicProgressSchema = z.object({
  status: z.enum(['in_progress', 'completed']),
})

export const lessonChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
})

export const runLessonCodeSchema = z.object({
  sourceCode: z.string().min(1, 'Source code is required'),
  languageId: z.coerce.number().int().positive().optional(),
  language: z.string().optional(),
  stdin: z.string().optional().default(''),
})

export const submitLessonCodeSchema = runLessonCodeSchema

export const getCodeHintSchema = z.object({
  sourceCode: z.string().min(1, 'Source code is required'),
  actualOutput: z.string().optional().default(''),
  errorOutput: z.string().optional().default(''),
  hintCount: z.coerce.number().int().min(0).default(0),
})

export const getOptimizedSolutionSchema = z.object({
  sourceCode: z.string().min(1, 'Source code is required'),
  language: z.string().optional(),
})

export const verifyLessonAnswerSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
})

export const verifyTopicSchema = z.object({
  trackerTitle: z.string().min(1),
  topicTitle: z.string().min(1),
  topicDescription: z.string().optional().default(''),
  existingTopics: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional().default(''),
      }),
    )
    .optional()
    .default([]),
})

export const verifySubtopicSchema = z.object({
  trackerTitle: z.string().min(1),
  topicTitle: z.string().min(1),
  topicDescription: z.string().optional().default(''),
  subtopicTitle: z.string().min(1),
  subtopicDescription: z.string().optional().default(''),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  existingSubtopics: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional().default(''),
        difficulty: z.string().optional().default(''),
      }),
    )
    .optional()
    .default([]),
})

export const generateLessonQuestionsSchema = z.object({
  count: z.number().int().min(1).max(10).optional(),
})

export const lessonQuestionSchema = z.object({
  question: z.string().trim().min(1),
})

export const askLessonQuestionSolutionDoubtSchema = z.object({
  question: z.string().trim().min(1),
  message: z.string().trim().min(1),
})

export type TrackerListQueryInput = z.infer<typeof trackerListQuerySchema>
export type CreateTrackerInput = z.infer<typeof createTrackerSchema>
export type UpdateTrackerInput = z.infer<typeof updateTrackerSchema>

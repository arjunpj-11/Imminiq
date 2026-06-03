import { z } from 'zod'

const objectId = z.string().min(1)
const questionSchema = z.object({
  type: z.enum(['mcq', 'short_answer', 'coding']),
  question: z.string().min(5),
  options: z.array(z.string().min(1)).optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  points: z.number().min(1).max(10).optional(),
}).superRefine((value, ctx) => {
  if (value.type === 'mcq' && (!value.options || value.options.length !== 4)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: 'MCQ must have exactly 4 options' })
  if (value.type === 'mcq' && !value.correctAnswer) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['correctAnswer'], message: 'MCQ correct answer is required' })
})

export const createMockTestSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(500).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  visibility: z.enum(['private', 'public']).optional(),
  timeLimitMinutes: z.number().min(5).max(180).optional(),
  passingScore: z.number().min(1).max(100).optional(),
  tags: z.array(z.string().min(1).max(40)).max(10).optional(),
  trackerId: z.string().optional(),
  questions: z.array(questionSchema).min(1).max(100),
})

export const generateMockTestSchema = z.object({
  topic: z.string().min(2).max(200),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  questionCount: z.number().min(1).max(50).optional(),
  questionTypes: z.array(z.enum(['mcq', 'short_answer', 'coding'])).min(1).optional(),
  trackerId: z.string().optional(),
  topicId: z.string().optional(),
  timeLimitMinutes: z.number().min(5).max(180).optional(),
  passingScore: z.number().min(1).max(100).optional(),
  visibility: z.enum(['private', 'public']).optional(),
})

export const submitAnswerSchema = z.object({ questionId: objectId, answer: z.string().min(1, 'Answer cannot be empty') })
export const flagQuestionSchema = z.object({ questionId: objectId })

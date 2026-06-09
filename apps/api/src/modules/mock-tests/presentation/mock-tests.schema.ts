import { z } from 'zod'

const objectId = z.string().min(1)

const codingLanguageSchema = z.enum([
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'c',
])

const codingValueTypeSchema = z.enum([
  'number',
  'string',
  'boolean',
  'number[]',
  'string[]',
  'boolean[]',
  'number[][]',
  'string[][]',
])

const codingTestCaseSchema = z.object({
  input: z.array(z.unknown()),
  expectedOutput: z.unknown(),
  isHidden: z.boolean().optional(),
  explanation: z.string().optional(),
})

const codingSchema = z.object({
  functionName: z.string().min(1).max(80),
  language: codingLanguageSchema.optional(),
  inputTypes: z.array(codingValueTypeSchema).min(1).max(6),
  outputType: codingValueTypeSchema,
  starterCode: z.string().min(10),
  templates: z
    .object({
      javascript: z.string().optional(),
      typescript: z.string().optional(),
      python: z.string().optional(),
      java: z.string().optional(),
      cpp: z.string().optional(),
      c: z.string().optional(),
    })
    .optional(),
  testCases: z.array(codingTestCaseSchema).min(1).max(20),
})

const questionSchema = z
  .object({
    type: z.enum(['mcq', 'short_answer', 'coding']),
    question: z.string().min(5),
    options: z.array(z.string().min(1)).optional(),
    correctAnswer: z.string().optional(),
    explanation: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    points: z.number().min(1).max(10).optional(),
    coding: codingSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.type === 'mcq' &&
      (!value.options || value.options.length !== 4)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'MCQ must have exactly 4 options',
      })
    }

    if (value.type === 'mcq' && !value.correctAnswer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctAnswer'],
        message: 'MCQ correct answer is required',
      })
    }

    if (value.type === 'coding' && !value.coding) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['coding'],
        message: 'Coding question details are required',
      })
    }
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
  questionTypes: z
    .array(z.enum(['mcq', 'short_answer', 'coding']))
    .min(1)
    .optional(),
  trackerId: z.string().optional(),
  topicId: z.string().optional(),
  timeLimitMinutes: z.number().min(5).max(180).optional(),
  passingScore: z.number().min(1).max(100).optional(),
  visibility: z.enum(['private', 'public']).optional(),
})

export const submitAnswerSchema = z.object({
  questionId: objectId,
  answer: z.string().min(1, 'Answer cannot be empty'),
})

export const runMockTestCodeSchema = z.object({
  sourceCode: z.string().min(1, 'Source code is required'),
  language: codingLanguageSchema.optional(),
  languageId: z.number().optional(),
})

export const submitMockTestCodeSchema = runMockTestCodeSchema

export const flagQuestionSchema = z.object({
  questionId: objectId,
})
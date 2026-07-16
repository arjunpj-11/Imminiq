import { z } from 'zod';

const objectIdSchema = z.string().trim().min(1, 'Id is required');

export const mockTestListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

const codingLanguageSchema = z.enum(['javascript', 'typescript', 'python', 'java', 'cpp', 'c']);

const codingValueTypeSchema = z.enum([
  'number',
  'string',
  'boolean',
  'number[]',
  'string[]',
  'boolean[]',
  'number[][]',
  'string[][]',
]);

const codingTestCaseSchema = z.object({
  input: z.array(z.unknown()),
  expectedOutput: z.unknown(),
  isHidden: z.boolean().optional(),
  explanation: z.string().optional(),
});

const codingSchema = z.object({
  functionName: z.string().trim().min(1).max(80),
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
});

const questionSchema = z
  .object({
    type: z.enum(['mcq', 'short_answer', 'coding']),
    question: z.string().trim().min(5),
    options: z.array(z.string().trim().min(1)).optional(),
    correctAnswer: z.string().trim().optional(),
    explanation: z.string().trim().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    points: z.number().min(1).max(10).optional(),
    coding: codingSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'mcq' && (!value.options || value.options.length !== 4)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'MCQ must have exactly 4 options',
      });
    }

    if (value.type === 'mcq' && !value.correctAnswer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctAnswer'],
        message: 'MCQ correct answer is required',
      });
    }

    if (value.type === 'coding' && !value.coding) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['coding'],
        message: 'Coding question details are required',
      });
    }
  });

export const createMockTestSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(500).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  visibility: z.enum(['private', 'public']).optional(),
  timeLimitMinutes: z.number().int().min(5).max(180).optional(),
  passingScore: z.number().int().min(1).max(100).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
  trackerId: z.string().trim().optional(),
  // Product policy applies the admin-managed limit; this is only a hard safety ceiling.
  questions: z.array(questionSchema).min(1).max(500),
});

export const generateMockTestSchema = z.object({
  topic: z.string().trim().min(2).max(200),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  questionCount: z.number().int().min(1).max(50).optional(),
  questionTypes: z
    .array(z.enum(['mcq', 'short_answer', 'coding']))
    .min(1)
    .optional(),
  trackerId: z.string().trim().optional(),
  topicId: z.string().trim().optional(),
  timeLimitMinutes: z.number().int().min(5).max(180).optional(),
  passingScore: z.number().int().min(1).max(100).optional(),
  visibility: z.enum(['private', 'public']).optional(),
  runInBackground: z.boolean().optional(),
});

export const submitAnswerSchema = z.object({
  questionId: objectIdSchema,
  answer: z.string().trim().min(1, 'Answer cannot be empty'),
});

export const runMockTestCodeSchema = z.object({
  sourceCode: z.string().min(1, 'Source code is required'),
  language: codingLanguageSchema.optional(),
  languageId: z.coerce.number().int().positive().max(1000).optional(),
});

export const submitMockTestCodeSchema = runMockTestCodeSchema;

export const flagQuestionSchema = z.object({
  questionId: objectIdSchema,
});

export const reportQuestionIssueSchema = z.object({
  reason: z.enum([
    'incorrect_answer',
    'ambiguous_question',
    'duplicate_question',
    'broken_code_or_test_case',
    'formatting_problem',
    'unsafe_or_offensive',
    'other',
  ]),
  details: z.string().trim().max(1500).optional().default(''),
});

export type CreateMockTestInput = z.infer<typeof createMockTestSchema>;

export type GenerateMockTestInput = z.infer<typeof generateMockTestSchema>;

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

export type RunMockTestCodeInput = z.infer<typeof runMockTestCodeSchema>;

export type SubmitMockTestCodeInput = z.infer<typeof submitMockTestCodeSchema>;

export type FlagQuestionInput = z.infer<typeof flagQuestionSchema>;

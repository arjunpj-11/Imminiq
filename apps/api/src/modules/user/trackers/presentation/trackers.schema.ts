import { z } from 'zod';

export const reportTrackerSchema = z.object({
  reason: z.enum([
    'incorrect_or_misleading',
    'unsafe_or_offensive',
    'spam_or_low_quality',
    'copyright_or_plagiarism',
    'broken_learning_path',
    'privacy_concern',
    'other',
  ]),
  details: z.string().trim().max(1500).optional().default(''),
});

const optionalTrimmedStringSchema = (maxLength: number, maxMessage: string) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }, z.string().max(maxLength, maxMessage).optional());

const defaultTrimmedStringSchema = (maxLength: number, maxMessage: string) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    return value.trim();
  }, z.string().max(maxLength, maxMessage).optional().default(''));

const titleSchema = z.string().trim().min(2).max(120);

const descriptionSchema = optionalTrimmedStringSchema(500, 'Description is too long');

const longDescriptionSchema = optionalTrimmedStringSchema(700, 'Description is too long');

const sourceCodeSchema = z.string().min(1, 'Source code is required');

const lessonLanguageSchema = optionalTrimmedStringSchema(40, 'Language is too long');

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
]);

export const trackerListQuerySchema = z.object({
  status: z.enum(['all', 'active', 'stalled', 'completed', 'archived']).optional(),
  domain: trackerDomainSchema.or(z.literal('all')).optional(),
  sortBy: z.enum(['lastActive', 'createdAt', 'progress', 'title']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const createTrackerSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  domain: trackerDomainSchema.optional(),
  goal: optionalTrimmedStringSchema(500, 'Goal is too long'),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  visibility: z.enum(['private', 'public']).optional(),
});

export const updateTrackerSchema = createTrackerSchema.partial();

export const publishTrackerSchema = z.object({
  name: optionalTrimmedStringSchema(120, 'Published name is too long'),
  description: descriptionSchema,
  domain: z
    .string()
    .trim()
    .min(1, 'Domain is required')
    .max(80, 'Domain must be 80 characters or fewer')
    .optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
  allowClone: z.boolean().optional(),
});

export const trackerDomainsQuerySchema = z.object({
  search: z.string().trim().max(80).optional().default(''),
});

export const createTopicSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
});

export const createSubtopicSchema = z.object({
  title: titleSchema,
  description: longDescriptionSchema,
  parentSubtopicId: optionalTrimmedStringSchema(120, 'Parent subtopic id is too long').nullable(),
  estimatedMinutes: z.coerce.number().int().min(0).max(1440).optional(),
});

export const reviewTopicContributionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reviewNote: optionalTrimmedStringSchema(500, 'Review note is too long'),
});

export const reviewClanJoinSchema = z.object({ action: z.enum(['approve', 'reject']) });

export const updateClanMemberSchema = z.object({ role: z.enum(['co_owner', 'member']) });

export const transferClanOwnershipSchema = z.object({
  newOwnerId: z.string().trim().min(1),
});

export const createClanChallengeSchema = z.object({
  opponentId: z.string().trim().min(1).optional(),
  durationMinutes: z.coerce.number().int().min(5).max(30).default(10),
  questionCount: z.coerce.number().int().min(3).max(15).default(10),
});

export const submitClanChallengeSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().trim().min(1),
        answer: z.string().trim().min(1).max(500),
      })
    )
    .max(15),
});

export const chooseClanChallengeCheckpointSchema = z.object({
  decision: z.enum(['attempt', 'skip']),
});

export const answerClanChallengeNodeSchema = z.object({
  answer: z.string().trim().min(1).max(500),
});

export const updateTrackerTopicSchema = z.object({
  title: titleSchema,
  description: defaultTrimmedStringSchema(500, 'Description is too long'),
});

export const updateSubtopicProgressSchema = z.object({
  status: z.enum(['in_progress', 'completed']),
});

export const lessonChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(4000),
      })
    )
    .min(1)
    .max(20),
});

export const runLessonCodeSchema = z.object({
  sourceCode: sourceCodeSchema,
  languageId: z.coerce.number().int().positive().optional(),
  language: lessonLanguageSchema,
  stdin: z.string().max(4000).optional().default(''),
});

export const submitLessonCodeSchema = runLessonCodeSchema;

export const getCodeHintSchema = z.object({
  sourceCode: sourceCodeSchema,
  actualOutput: z.string().max(4000).optional().default(''),
  errorOutput: z.string().max(4000).optional().default(''),
  hintCount: z.coerce.number().int().min(0).max(5).default(0),
});

export const getOptimizedSolutionSchema = z.object({
  sourceCode: sourceCodeSchema,
  language: lessonLanguageSchema,
});

export const verifyLessonAnswerSchema = z.object({
  question: z.string().trim().min(1, 'Question is required').max(4000),
  answer: z.string().trim().min(1, 'Answer is required').max(4000),
});

export const verifyTopicSchema = z.object({
  trackerTitle: z.string().trim().min(1).max(120),
  topicTitle: z.string().trim().min(1).max(120),
  topicDescription: defaultTrimmedStringSchema(500, 'Topic description is too long'),
  existingTopics: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        title: z.string().trim().min(1).max(120),
        description: defaultTrimmedStringSchema(500, 'Topic description is too long'),
      })
    )
    .optional()
    .default([]),
});

export const verifySubtopicSchema = z.object({
  trackerTitle: z.string().trim().min(1).max(120),
  topicTitle: z.string().trim().min(1).max(120),
  topicDescription: defaultTrimmedStringSchema(500, 'Topic description is too long'),
  subtopicTitle: z.string().trim().min(1).max(120),
  subtopicDescription: defaultTrimmedStringSchema(700, 'Subtopic description is too long'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  existingSubtopics: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        title: z.string().trim().min(1).max(120),
        description: defaultTrimmedStringSchema(700, 'Subtopic description is too long'),
        difficulty: defaultTrimmedStringSchema(40, 'Difficulty is too long'),
      })
    )
    .optional()
    .default([]),
});

export const generateLessonQuestionsSchema = z.object({
  count: z.coerce.number().int().min(1).max(10).optional(),
});

export const lessonQuestionSchema = z.object({
  question: z.string().trim().min(1).max(4000),
});

export const askLessonQuestionSolutionDoubtSchema = z.object({
  question: z.string().trim().min(1).max(4000),
  message: z.string().trim().min(1).max(4000),
});

export type TrackerDomainInput = z.infer<typeof trackerDomainSchema>;

export type TrackerListQueryInput = z.infer<typeof trackerListQuerySchema>;

export type CreateTrackerInput = z.infer<typeof createTrackerSchema>;

export type UpdateTrackerInput = z.infer<typeof updateTrackerSchema>;

export type CreateTopicInput = z.infer<typeof createTopicSchema>;

export type CreateSubtopicInput = z.infer<typeof createSubtopicSchema>;

export type UpdateSubtopicProgressInput = z.infer<typeof updateSubtopicProgressSchema>;

export type LessonChatInput = z.infer<typeof lessonChatSchema>;

export type RunLessonCodeInput = z.infer<typeof runLessonCodeSchema>;

export type SubmitLessonCodeInput = z.infer<typeof submitLessonCodeSchema>;

export type GetCodeHintInput = z.infer<typeof getCodeHintSchema>;

export type GetOptimizedSolutionInput = z.infer<typeof getOptimizedSolutionSchema>;

export type VerifyLessonAnswerInput = z.infer<typeof verifyLessonAnswerSchema>;

export type VerifyTopicInput = z.infer<typeof verifyTopicSchema>;

export type VerifySubtopicInput = z.infer<typeof verifySubtopicSchema>;

export type GenerateLessonQuestionsInput = z.infer<typeof generateLessonQuestionsSchema>;

export type LessonQuestionInput = z.infer<typeof lessonQuestionSchema>;

export type AskLessonQuestionSolutionDoubtInput = z.infer<
  typeof askLessonQuestionSolutionDoubtSchema
>;

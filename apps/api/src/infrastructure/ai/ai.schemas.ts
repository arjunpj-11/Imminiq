import { z } from 'zod';

// ============================================================
// SHARED ROADMAP STRUCTURE TYPES
// ============================================================

export type RoadmapNestedNode = {
  title: string;
  description: string;
  order: number;
  children: RoadmapNestedNode[];
};

export const roadmapNestedNodeSchema: z.ZodType<RoadmapNestedNode> = z.lazy(() =>
  z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().default(''),
    order: z.number().int().min(1),
    children: z.array(roadmapNestedNodeSchema).default([]),
  })
);

export const roadmapTopicSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().default(''),
  order: z.number().int().min(1),
  children: z.array(roadmapNestedNodeSchema).default([]),
});

export const generatedRoadmapStructureSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().default(''),
  topics: z.array(roadmapTopicSchema).min(1),
});

export type GeneratedRoadmapStructure = z.infer<typeof generatedRoadmapStructureSchema>;

export type LessonVisualizationResult = {
  html: string;
  visualTitle: string;
  visualDescription: string;
};

export interface IVisualizationInput {
  title: string;
  summary: string;
  explanation: string;
  lessonType: string;
  tags: string[];
  difficulty: string;
  codeExample?: {
    code?: string;
    language?: string;
  };
}

// ============================================================
// ROADMAP EVALUATION TYPES
// ============================================================

export const roadmapEvaluationSchema = z.object({
  score: z.number().int().min(0).max(100),

  grade: z.enum(['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']),

  summary: z.string().trim().min(1),

  missingTopics: z.array(
    z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      reason: z.string().trim().min(1),
      suggestedParentTitle: z.string().trim().min(1),
    })
  ),
});

export type RoadmapEvaluation = z.infer<typeof roadmapEvaluationSchema>;

// ============================================================
// GROQ LESSON GENERATION TYPES
// ============================================================

export const generatedLessonSchema = z.object({
  title: z.string().trim().min(1),

  summary: z.string().trim().min(1),

  explanation: z.string().trim().min(1),

  insight: z.string().trim().min(1),

  lessonType: z
    .enum(['concept', 'coding', 'interview', 'system_design', 'theory'])
    .default('concept'),

  compilerRuntime: z
    .enum(['javascript', 'typescript', 'python', 'c++', 'c', 'java'])
    .nullable()
    .default(null),

  codeExample: z.object({
    language: z.string().trim().default('javascript'),
    fileName: z.string().trim().default('lesson.js'),
    code: z.string().default(''),
  }),

  practiceTask: z.object({
    title: z.string().trim().default('Practice task'),
    description: z.string().trim().default(''),
    starterCode: z.string().default(''),
    expectedOutput: z.string().default(''),
    expectedAnswer: z.string().default(''),
  }),

  tags: z.array(z.string().trim()).default([]),

  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),

  estimatedMinutes: z.number().int().min(5).max(90).default(15),
});

export type GeneratedLesson = z.infer<typeof generatedLessonSchema>;

// ============================================================
// PRACTICE / ANSWER VERIFICATION TYPES
// ============================================================

export const codeHintSchema = z.object({
  mode: z.enum(['hint', 'issue']),
  title: z.string().trim().min(1),
  explanation: z.string().trim().min(1),
});

export type CodeHintAIResult = z.infer<typeof codeHintSchema>;

export const optimizedSolutionSchema = z.object({
  optimizedCode: z.string().default(''),
  explanation: z.string().trim().min(1),
  improvements: z.array(z.string().trim().min(1)).default([]),
});

export type OptimizedSolutionAIResult = z.infer<typeof optimizedSolutionSchema>;

export const answerVerificationSchema = z.object({
  verdict: z.enum(['correct', 'partially_correct', 'incorrect']),
  score: z.number().int().min(0).max(100),
  feedback: z.string().trim().min(1),
  correctedAnswer: z.string().trim().min(1),
  keyPoints: z.array(z.string().trim().min(1)).default([]),
});

export type AnswerVerificationAIResult = z.infer<typeof answerVerificationSchema>;

export const lessonPracticeQuestionsSchema = z.object({
  questions: z.array(z.string().trim().min(1)).min(1).max(10),
});

export type LessonPracticeQuestionsAIResult = z.infer<typeof lessonPracticeQuestionsSchema>;

// ============================================================
// TRACKER VERIFICATION TYPES
// ============================================================

export const trackerTopicVerificationSchema = z.object({
  verified: z.boolean(),
  message: z.string().trim().min(1),
  polishedTitle: z.string().trim().min(1),
  polishedDescription: z.string().trim().default(''),
});

export const trackerSubtopicVerificationSchema = z.object({
  verified: z.boolean(),
  message: z.string().trim().min(1),
  polishedTitle: z.string().trim().min(1),
  polishedDescription: z.string().trim().default(''),
});

export type TrackerTopicVerificationResult = z.infer<typeof trackerTopicVerificationSchema>;

export type TrackerSubtopicVerificationResult = z.infer<typeof trackerSubtopicVerificationSchema>;

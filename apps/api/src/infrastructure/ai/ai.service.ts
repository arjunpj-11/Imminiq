// apps/api/src/infrastructure/ai/ai.service.ts

import { z } from 'zod'

import { ApiError } from '../../shared/utils/ApiError'

import {
  geminiChat,
  geminiFlashLiteChat,
  gemini31FlashLiteChat,
} from './gemini.client'

import {
  cerebrasRoadmapStructureChat,
  cerebrasRoadmapEvaluationChat,
} from './cerebras.client'

import { groqChat } from './groq.client'

// ============================================================
// SHARED ROADMAP STRUCTURE TYPES
// ============================================================

export type RoadmapNestedNode = {
  title: string
  description: string
  order: number
  children: RoadmapNestedNode[]
}

const roadmapNestedNodeSchema: z.ZodType<RoadmapNestedNode> =
  z.lazy(() =>
    z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().default(''),
      order: z.number().int().min(1),
      children: z.array(roadmapNestedNodeSchema).default([]),
    })
  )

const roadmapTopicSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().default(''),
  order: z.number().int().min(1),
  children: z.array(roadmapNestedNodeSchema).default([]),
})

const generatedRoadmapStructureSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().default(''),
  topics: z.array(roadmapTopicSchema).min(1),
})

export type GeneratedRoadmapStructure = z.infer<
  typeof generatedRoadmapStructureSchema
>

// ============================================================
// ROADMAP EVALUATION TYPES
// ============================================================

const roadmapEvaluationSchema = z.object({
  score: z.number().int().min(0).max(100),

  grade: z.enum([
    'Poor',
    'Fair',
    'Good',
    'Very Good',
    'Excellent',
  ]),

  summary: z.string().trim().min(1),

  missingTopics: z.array(
    z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      reason: z.string().trim().min(1),
      suggestedParentTitle: z.string().trim().min(1),
    })
  ),
})

export type RoadmapEvaluation = z.infer<
  typeof roadmapEvaluationSchema
>

// ============================================================
// GROQ LESSON GENERATION TYPES
// ============================================================

const generatedLessonSchema = z.object({
  title: z.string().trim().min(1),

  summary: z.string().trim().min(1),

  explanation: z.string().trim().min(1),

  insight: z.string().trim().min(1),

  lessonType: z
    .enum([
      'concept',
      'coding',
      'interview',
      'system_design',
      'theory',
    ])
    .default('concept'),

  requiresCompiler: z.boolean().default(false),

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

  difficulty: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .default('beginner'),

  estimatedMinutes: z.number().int().min(5).max(90).default(15),
})

export type GeneratedLesson = z.infer<
  typeof generatedLessonSchema
>

// ============================================================
// PRACTICE / ANSWER VERIFICATION TYPES
// ============================================================

const codeHintSchema = z.object({
  mode: z.enum(['hint', 'issue']),
  title: z.string().trim().min(1),
  explanation: z.string().trim().min(1),
})

export type CodeHintAIResult = z.infer<typeof codeHintSchema>

const optimizedSolutionSchema = z.object({
  optimizedCode: z.string().default(''),
  explanation: z.string().trim().min(1),
  improvements: z.array(z.string().trim().min(1)).default([]),
})

export type OptimizedSolutionAIResult = z.infer<
  typeof optimizedSolutionSchema
>

const answerVerificationSchema = z.object({
  verdict: z.enum([
    'correct',
    'partially_correct',
    'incorrect',
  ]),
  score: z.number().int().min(0).max(100),
  feedback: z.string().trim().min(1),
  correctedAnswer: z.string().trim().min(1),
  keyPoints: z.array(z.string().trim().min(1)).default([]),
})

export type AnswerVerificationAIResult = z.infer<
  typeof answerVerificationSchema
>

// ============================================================
// JSON PARSER HELPER
// ============================================================

const parseAIJson = <T>(
  response: string,
  schema: z.ZodSchema<T>
): T => {
  const cleaned = response
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned)
    return schema.parse(parsed)
  } catch (error) {
    console.error('AI JSON parse failed:', {
      response: cleaned,
      error,
    })

    throw new ApiError(
      502,
      'AI returned invalid JSON',
      'AI_INVALID_JSON'
    )
  }
}

// ============================================================
// AI FALLBACK HELPERS
// ============================================================

const shouldFallbackFromProvider = (
  error: unknown
): boolean => {
  if (!error || typeof error !== 'object') {
    return false
  }

  const possibleError = error as {
    status?: number
    statusCode?: number
    message?: string
  }

  const message =
    possibleError.message?.toLowerCase() || ''

  return (
    possibleError.status === 429 ||
    possibleError.statusCode === 429 ||
    possibleError.status === 503 ||
    possibleError.statusCode === 503 ||
    possibleError.status === 500 ||
    possibleError.statusCode === 500 ||
    message.includes('429') ||
    message.includes('503') ||
    message.includes('500') ||
    message.includes('resource_exhausted') ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('high demand') ||
    message.includes('service unavailable') ||
    message.includes('unavailable') ||
    message.includes('temporarily unavailable') ||
    message.includes('overloaded')
  )
}

const heavyAIChatWithFallback = async (
  prompt: string,
  system: string,
  cerebrasFallback: (
    prompt: string,
    system?: string
  ) => Promise<string>
) => {
  try {
    return await geminiChat(prompt, system)
  } catch (geminiFlashError) {
    if (!shouldFallbackFromProvider(geminiFlashError)) {
      throw geminiFlashError
    }

    console.warn(
      '⚠️ Gemini 2.5 Flash unavailable or quota-limited. Trying Gemini 2.5 Flash-Lite.'
    )
  }

  try {
    return await geminiFlashLiteChat(prompt, system)
  } catch (geminiFlashLiteError) {
    if (!shouldFallbackFromProvider(geminiFlashLiteError)) {
      throw geminiFlashLiteError
    }

    console.warn(
      '⚠️ Gemini 2.5 Flash-Lite unavailable or quota-limited. Trying Gemini 3.1 Flash-Lite.'
    )
  }

  try {
    return await gemini31FlashLiteChat(prompt, system)
  } catch (gemini31FlashLiteError) {
    if (!shouldFallbackFromProvider(gemini31FlashLiteError)) {
      throw gemini31FlashLiteError
    }

    console.warn(
      '⚠️ Gemini 3.1 Flash-Lite unavailable or quota-limited. Falling back to Cerebras structured output.'
    )
  }

  return cerebrasFallback(prompt, system)
}

// ============================================================
// GEMINI / CEREBRAS — COMPLEX ROADMAP GENERATION
// ============================================================

export const generateRoadmapStructure = async (
  topic: string,
  goal: string | undefined,
  level: 'beginner' | 'intermediate' | 'advanced'
): Promise<GeneratedRoadmapStructure> => {
  const prompt = `
You are a senior curriculum architect, interview mentor, and full learning-path designer.

Your task is to generate a COMPLETE ZERO-TO-HERO MASTER ROADMAP for the user's requested topic.

This roadmap is not a small overview.
It must be detailed enough to become the learner's main long-term tracker.

User Input:
- Topic / Stack: ${topic}
- Goal: ${goal || 'Build complete practical mastery'}
- Current Level: ${level}

Core product behavior:
- The roadmap is stored as a structured tracker.
- Actual long-form lessons, code explanations, and AI tutoring will be generated later when the user opens a roadmap item.
- Therefore, every roadmap item must be specific, useful, and checklist-ready, but its description should remain concise.

============================================================
ROADMAP QUALITY TARGET
============================================================

Generate a roadmap that:
- takes the learner from foundation to advanced mastery
- is far more detailed than a basic syllabus
- covers what to learn, what to practice, what interviewers ask, and what commonly confuses learners
- is suitable for serious preparation, not casual browsing
- is logically ordered from zero → strong foundation → applied skill → advanced interview readiness

For broad technical interview topics, the roadmap should include where relevant:
- fundamentals and prerequisites
- deep core concepts
- internals and mental models
- practical implementation skills
- architecture and real-world patterns
- testing and debugging
- performance and optimization
- security and reliability
- deployment and production concerns
- coding/problem-solving exercises
- common interview comparisons
- common interview questions
- tricky edge cases and misconceptions
- capstone-level integration themes

If the topic is software interview preparation or a stack like MERN/full-stack/frontend/backend:
- Include DSA/problem-solving where relevant.
- Include system design fundamentals where relevant.
- Include HTTP/web fundamentals, auth, security, performance, testing, deployment, databases, and architecture when relevant.
- Include common interview-question nodes and implementation-task nodes.

============================================================
HIERARCHY RULES
============================================================

Use this structure:

TOPIC
  → SECTION
      → CHECKLIST ITEM

Meaning:
- "topics" = major roadmap domains or large modules
- first-level children = sections inside that domain
- second-level children = precise checklist-style learning items

For this version:
- Prefer exactly 2 nested levels below each top-level topic:
  Topic → Section → Checklist Item
- Checklist items should normally have "children": [].
- Do not create unnecessarily deep trees beyond that unless absolutely required.

============================================================
DETAIL DEPTH
============================================================

For broad roadmap topics such as MERN interviews, full-stack development, frontend interviews, backend interviews, data science, etc.:
- Generate about 10 to 18 top-level topics.
- Each top-level topic should have about 3 to 8 meaningful sections.
- Each section should have about 4 to 10 checklist items.
- The total roadmap should generally contain around 160 to 280 checklist items when the topic is broad enough.

For narrower topics, scale down naturally, but still be complete.

Do not produce a shallow 10-topic summary.
Do not skip important fundamentals.
Do not skip interview-heavy concepts.

============================================================
CHECKLIST ITEM STYLE
============================================================

Leaf nodes should be concrete and study-ready.

Good examples:
- "var, let, const — scope, hoisting, TDZ, and interview traps"
- "Interview Q: Why does Promise.then run before setTimeout(..., 0)?"
- "Practice: Implement debounce and throttle from scratch"
- "Compare: shallow copy vs deep copy in JavaScript"
- "Common pitfall: stale closures inside React effects"
- "Interview Q: Explain MongoDB indexing trade-offs"
- "Practice: Design refresh-token rotation with httpOnly cookies"

Avoid vague items like:
- "Learn JavaScript"
- "Advanced concepts"
- "Backend basics"

============================================================
DESCRIPTION RULES
============================================================

Every topic, section, and checklist item must include a concise "description".

Description style:
- 1 short sentence.
- Explain what the learner should understand, compare, implement, or be ready to answer.
- Do not write full lessons.
- Do not write paragraphs.

============================================================
OUTPUT FORMAT
============================================================

Return ONLY valid JSON.
No markdown.
No comments.
No explanation before or after JSON.

Use this exact JSON structure:

{
  "title": "string",
  "description": "2 sentence maximum overview of the complete zero-to-hero roadmap",
  "topics": [
    {
      "title": "Main Topic Title",
      "description": "Short description of this major roadmap domain",
      "order": 1,
      "children": [
        {
          "title": "Section Title",
          "description": "Short description of this section",
          "order": 1,
          "children": [
            {
              "title": "Specific checklist item title",
              "description": "Short description of what to master or answer",
              "order": 1,
              "children": []
            }
          ]
        }
      ]
    }
  ]
}

Final checks before responding:
- JSON must be valid.
- Every object must include title, description, order where applicable, and children.
- All order numbers must start at 1 and increment inside their own sibling group.
- Checklist leaves must have "children": [].
- The roadmap must feel like a complete study tracker, not a short outline.
`

  const response = await heavyAIChatWithFallback(
    prompt,
    'You are an elite curriculum architect. Return strict valid JSON only. Build complete zero-to-hero master roadmaps with interview depth.',
    cerebrasRoadmapStructureChat
  )

  return parseAIJson(
    response,
    generatedRoadmapStructureSchema
  )
}

export const evaluateRoadmap = async (
  roadmap: unknown
): Promise<RoadmapEvaluation> => {
  const prompt = `
You are a strict expert curriculum evaluator, interview mentor, and learning-path reviewer.

Your task is to critically evaluate this AI-generated roadmap.

The roadmap must be judged as a COMPLETE ZERO-TO-HERO MASTER ROADMAP.

============================================================
ROADMAP TO EVALUATE
============================================================

${JSON.stringify(roadmap, null, 2)}

============================================================
SCORING RULES
============================================================

Score from 0 to 100.

Be strict:
- 90–100: truly excellent, very detailed, highly complete, strongly interview-ready
- 75–89: strong roadmap, but some meaningful improvements are still possible
- 60–74: usable, but incomplete or not detailed enough in several areas
- 40–59: weak, too shallow, or significantly missing major coverage
- 0–39: poor, highly incomplete, or unsuitable as a zero-to-hero roadmap

Lower the score when:
- the roadmap is shallow
- the roadmap is not genuinely zero-to-hero
- advanced depth is lacking
- topic sequencing is weak
- interview preparation is weak where expected
- practical projects, implementation tasks, or applied learning are missing
- testing, debugging, performance, security, deployment, or architecture are missing where relevant
- roadmap nodes are too vague
- roadmap does not have enough concrete checklist-style items

============================================================
GRADE RULES
============================================================

Assign grade exactly as:
- 0 to 39 = "Poor"
- 40 to 59 = "Fair"
- 60 to 74 = "Good"
- 75 to 89 = "Very Good"
- 90 to 100 = "Excellent"

============================================================
OUTPUT FORMAT
============================================================

Return ONLY valid JSON.
No markdown.
No comments.
No explanation before or after JSON.

Use this exact JSON structure:

{
  "score": 0,
  "grade": "Poor",
  "summary": "A clear overall evaluation of the roadmap quality, completeness, and interview-readiness.",
  "missingTopics": [
    {
      "title": "Exact topic that should be added",
      "description": "Short checklist-ready description for this missing topic.",
      "reason": "Why this topic is important and why it is considered missing.",
      "suggestedParentTitle": "The most suitable existing roadmap section or topic title where this should be added."
    }
  ]
}

Final checks:
- JSON must be valid.
- score must be an integer from 0 to 100.
- grade must exactly match the score range.
- summary must explain the overall quality clearly.
- missingTopics should contain only genuinely useful additions.
- Each missing topic must be concrete enough to insert directly into the tracker.
- suggestedParentTitle must match or closely reference the best existing roadmap topic or section title.
- If the roadmap is already extremely complete, missingTopics may be an empty array.
`

  const response = await heavyAIChatWithFallback(
    prompt,
    'You are a strict roadmap evaluator. Return strict valid JSON only.',
    cerebrasRoadmapEvaluationChat
  )

  return parseAIJson(
    response,
    roadmapEvaluationSchema
  )
}

// ============================================================
// GROQ — LESSON GENERATION
// ============================================================

export const generateLesson = async (input: {
  trackerTitle: string
  topicTitle?: string
  subtopicTitle: string
  subtopicDescription?: string
  level?: 'beginner' | 'intermediate' | 'advanced'
}): Promise<GeneratedLesson> => {
  const codingKeywordText = [
    input.trackerTitle,
    input.topicTitle || '',
    input.subtopicTitle,
    input.subtopicDescription || '',
  ]
    .join(' ')
    .toLowerCase()

  const shouldForceCompiler =
    /\b(javascript|typescript|react|node|express|mongodb|mongoose|array|object|string|function|loop|promise|async|await|callback|closure|scope|hoisting|var|let|const|class|inheritance|prototype|dom|api|fetch|axios|algorithm|dsa|stack|queue|linked list|tree|graph|sorting|searching|recursion|dynamic programming|code|coding|programming|implementation|debug|debugging)\b/.test(
      codingKeywordText
    )

  const response = await groqChat(
    [
      {
        role: 'system',
        content:
          'You are Scribe AI, an expert programming tutor inside Imminiq. Return only strict valid JSON. No markdown. No extra explanation.',
      },
      {
        role: 'user',
        content: `
Generate a full lesson for this roadmap node.

Tracker:
${input.trackerTitle}

Parent topic:
${input.topicTitle || 'Not provided'}

Lesson node:
${input.subtopicTitle}

Node description:
${input.subtopicDescription || 'No description provided'}

Learner level:
${input.level || 'beginner'}

Important compiler decision:
This lesson ${
          shouldForceCompiler
            ? 'IS detected as a coding/programming lesson, so requiresCompiler MUST be true.'
            : 'may or may not need compiler. Decide based on whether the learner should write/run code.'
        }

Return ONLY valid JSON using this exact structure:

{
  "title": "string",
  "summary": "short overview",
  "explanation": "clear detailed lesson explanation in simple English",
  "insight": "one helpful analogy or mental model",
  "lessonType": "concept",
  "requiresCompiler": false,
  "codeExample": {
    "language": "javascript",
    "fileName": "lesson.js",
    "code": ""
  },
  "practiceTask": {
    "title": "practice title",
    "description": "what the user should try",
    "starterCode": "",
    "expectedOutput": "",
    "expectedAnswer": ""
  },
  "tags": ["tag1", "tag2"],
  "difficulty": "beginner",
  "estimatedMinutes": 15
}

Lesson type rule:
- Use "coding" for JavaScript, TypeScript, React, Node.js, Express, MongoDB query, DSA, algorithm, implementation, debugging, syntax, or programming lessons.
- Use "interview" for interview-question/explanation lessons.
- Use "system_design" for architecture, scaling, distributed systems, database design, API design, or design lessons.
- Use "theory" for pure conceptual/theoretical lessons.
- Use "concept" for normal non-code learning concepts.

Compiler rule:
- Set "requiresCompiler": true for any lesson where code can help the learner understand by running examples.
- Set "requiresCompiler": true for JavaScript syntax topics like var, let, const, scope, hoisting, closure, functions, arrays, objects, promises, async/await, loops, and DOM.
- Set "requiresCompiler": true for DSA, algorithms, implementation tasks, debugging, backend logic, API examples, MongoDB query examples, and coding interview topics.
- Set "requiresCompiler": false only for pure theory, system design, architecture explanation, comparison-only lessons, or non-coding lessons.
- If requiresCompiler is true, provide runnable codeExample.code and useful practiceTask.starterCode.
- If requiresCompiler is false, keep codeExample.code and practiceTask.starterCode as empty strings.
- Use JavaScript code by default unless another language is clearly implied.

Practice task rule:
- If requiresCompiler is true:
  - Create a coding problem, not only a reflection question.
  - practiceTask.description must clearly state the coding challenge.
  - practiceTask.starterCode must include incomplete starter code the learner can edit.
  - practiceTask.expectedOutput must be the exact stdout expected from a correct solution.
  - practiceTask.expectedAnswer must be an empty string.
- If requiresCompiler is false:
  - Create a written answer/problem-solving question.
  - practiceTask.description must be a question or problem the learner can answer by typing.
  - practiceTask.expectedAnswer must contain a reference answer for verification.
  - practiceTask.starterCode and practiceTask.expectedOutput must be empty strings.

Quality rules:
- Make the lesson practical and interview-useful.
- Explanation should be detailed but readable.
- Avoid vague generic content.
- Do not use markdown fences.
        `.trim(),
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty lesson response',
      'GROQ_EMPTY_LESSON_RESPONSE'
    )
  }

  const lesson = parseAIJson(response, generatedLessonSchema)

  if (shouldForceCompiler) {
    return {
      ...lesson,
      lessonType: 'coding',
      requiresCompiler: true,
      codeExample: {
        language: lesson.codeExample.language || 'javascript',
        fileName: lesson.codeExample.fileName || 'lesson.js',
        code:
          lesson.codeExample.code ||
          `// ${input.subtopicTitle}\n\nconsole.log("Practice ${input.subtopicTitle} here");`,
      },
      practiceTask: {
        title:
          lesson.practiceTask.title ||
          `Practice ${input.subtopicTitle}`,
        description:
          lesson.practiceTask.description ||
          `Write and run code examples to understand ${input.subtopicTitle}.`,
        starterCode:
          lesson.practiceTask.starterCode ||
          `// Try examples for ${input.subtopicTitle}\n\n`,
        expectedOutput:
          lesson.practiceTask.expectedOutput || '',
        expectedAnswer: '',
      },
    }
  }

  return lesson
}

export const chatWithLessonTutor = async (input: {
  lessonTitle: string
  lessonContent: string
  messages: {
    role: 'user' | 'assistant' | 'system'
    content: string
  }[]
}) => {
  const response = await groqChat(
    [
      {
        role: 'system',
        content: `
You are Scribe AI, a helpful tutor for one lesson inside Imminiq.

Lesson title:
${input.lessonTitle}

Lesson content:
${input.lessonContent}

Rules:
- Answer clearly and simply.
- Use examples when helpful.
- Keep answers focused on this lesson.
- Do not hallucinate app data.
        `.trim(),
      },
      ...input.messages,
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty tutor response',
      'GROQ_EMPTY_TUTOR_RESPONSE'
    )
  }

  return response
}

// ============================================================
// GROQ — LESSON PRACTICE AI HELPERS
// ============================================================

export const generateCodeHint = async (input: {
  lessonTitle: string
  practiceTitle: string
  practiceDescription: string
  expectedOutput: string
  sourceCode: string
  actualOutput?: string
  errorOutput?: string
  hintCount: number
}): Promise<CodeHintAIResult> => {
  const revealIssue = input.hintCount >= 3

  const response = await groqChat(
    [
      {
        role: 'system',
        content:
          'You are Scribe AI, a supportive coding tutor. Return only strict valid JSON. No markdown.',
      },
      {
        role: 'user',
        content: `
The learner submitted code for a coding practice.

Lesson:
${input.lessonTitle}

Practice title:
${input.practiceTitle}

Practice task:
${input.practiceDescription}

Expected output:
${input.expectedOutput || 'Not provided'}

User code:
${input.sourceCode}

Actual stdout:
${input.actualOutput || 'No stdout'}

Error output:
${input.errorOutput || 'No error'}

Hints already used:
${input.hintCount}

Rule:
${
  revealIssue
    ? 'The learner already used 3 hints. Now directly reveal the exact issue in the code and explain how to fix it.'
    : 'Give only one useful hint. Do not reveal the full answer or fixed code.'
}

Return ONLY valid JSON using this exact structure:

{
  "mode": "${revealIssue ? 'issue' : 'hint'}",
  "title": "short title",
  "explanation": "clear explanation"
}
        `.trim(),
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty code hint response',
      'GROQ_EMPTY_CODE_HINT_RESPONSE'
    )
  }

  return parseAIJson(response, codeHintSchema)
}

export const generateOptimizedCodeSolution = async (input: {
  lessonTitle: string
  practiceTitle: string
  practiceDescription: string
  sourceCode: string
  language?: string
}): Promise<OptimizedSolutionAIResult> => {
  const response = await groqChat(
    [
      {
        role: 'system',
        content:
          'You are Scribe AI, an expert coding mentor. Return only strict valid JSON. No markdown.',
      },
      {
        role: 'user',
        content: `
The learner solved this coding task correctly.

Compare their code with a more optimized or cleaner solution.

Lesson:
${input.lessonTitle}

Practice title:
${input.practiceTitle}

Practice task:
${input.practiceDescription}

Language:
${input.language || 'javascript'}

User code:
${input.sourceCode}

Return ONLY valid JSON using this exact structure:

{
  "optimizedCode": "optimized code here",
  "explanation": "why this version is better or cleaner",
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}
        `.trim(),
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty optimized solution response',
      'GROQ_EMPTY_OPTIMIZED_SOLUTION_RESPONSE'
    )
  }

  return parseAIJson(response, optimizedSolutionSchema)
}

export const verifyNonCodingAnswer = async (input: {
  lessonTitle: string
  lessonExplanation: string
  question: string
  expectedAnswer?: string
  userAnswer: string
}): Promise<AnswerVerificationAIResult> => {
  const response = await groqChat(
    [
      {
        role: 'system',
        content:
          'You are Scribe AI, a strict but supportive lesson-answer evaluator. Return only strict valid JSON. No markdown.',
      },
      {
        role: 'user',
        content: `
Verify the learner's answer.

Lesson:
${input.lessonTitle}

Lesson explanation:
${input.lessonExplanation}

Question:
${input.question}

Reference answer:
${input.expectedAnswer || 'Not provided'}

Learner answer:
${input.userAnswer}

Return ONLY valid JSON using this exact structure:

{
  "verdict": "correct",
  "score": 0,
  "feedback": "short supportive feedback",
  "correctedAnswer": "a better complete answer",
  "keyPoints": ["key point 1", "key point 2", "key point 3"]
}

Rules:
- verdict must be one of: "correct", "partially_correct", "incorrect".
- score must be an integer from 0 to 100.
- If the answer is fully correct, still give a polished correctedAnswer.
- If the answer is weak, explain what is missing.
- Keep feedback simple and helpful.
        `.trim(),
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty answer verification response',
      'GROQ_EMPTY_ANSWER_VERIFICATION_RESPONSE'
    )
  }

  return parseAIJson(response, answerVerificationSchema)
}

// ============================================================
// LEGACY / GENERAL AI HELPERS
// ============================================================

export const generateRoadmap = (
  goal: string,
  level: string
) =>
  geminiChat(
    `Generate a detailed learning roadmap for ${goal} at ${level} level`,
    'You are an expert learning path designer.'
  )

export const detectMissingTopics = (
  roadmap: string,
  targetRole: string
) =>
  geminiChat(
    `Compare this roadmap against ${targetRole} requirements and list missing topics: ${roadmap}`,
    'You are a curriculum gap analyst.'
  )

export const analyzeTestPerformance = (results: string) =>
  geminiChat(
    `Analyze this test performance and identify weak areas: ${results}`,
    'You are a learning analytics expert.'
  )

export const generateDashboardInsights = async (
  userData: string
) => {
  const response = await groqChat(
    [
      {
        role: 'system',
        content:
          'You are a concise personalized learning coach for a dashboard card. Return only one short, helpful insight. No markdown, no bullet points, no numbering, no greeting, no emojis. Keep the response under 35 words.',
      },
      {
        role: 'user',
        content: `
Create one short personalized dashboard insight from this learner data:

${userData}

Rules:
- Mention the most useful next action.
- Be encouraging but direct.
- Keep it to 1 or 2 short sentences maximum.
- Do not exceed 35 words.
        `.trim(),
      },
    ],
    'llama-3.1-8b-instant'
  )

  return (
    response ||
    'Focus on completing one small lesson today to keep your learning momentum strong.'
  )
}

// ============================================================
// GROQ LLAMA 3.3 70B — CONVERSATIONAL TASKS
// ============================================================

export const chatWithTutor = async (
  messages: {
    role: 'user' | 'assistant' | 'system'
    content: string
  }[]
) => {
  const response = await groqChat(
    messages,
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty chat response',
      'GROQ_EMPTY_CHAT_RESPONSE'
    )
  }

  return response
}

export const explainTopic = async (topic: string) => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Explain this topic clearly with examples: ${topic}`,
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty topic explanation',
      'GROQ_EMPTY_TOPIC_EXPLANATION'
    )
  }

  return response
}

export const explainELI5 = async (topic: string) => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Explain this like I am 5 years old: ${topic}`,
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty ELI5 explanation',
      'GROQ_EMPTY_ELI5_RESPONSE'
    )
  }

  return response
}

export const generateMockQuestions = async (
  topic: string,
  count: number
) => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Generate ${count} MCQ questions for: ${topic}. Return as JSON array.`,
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned empty mock questions',
      'GROQ_EMPTY_MOCK_QUESTIONS'
    )
  }

  return response
}

export const reviewCode = async (
  code: string,
  language: string
) => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Review this ${language} code and suggest improvements: ${code}`,
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty code review',
      'GROQ_EMPTY_CODE_REVIEW'
    )
  }

  return response
}

export const optimizeCode = async (
  code: string,
  language: string
) => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Optimize this ${language} code: ${code}`,
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty optimized code response',
      'GROQ_EMPTY_OPTIMIZE_RESPONSE'
    )
  }

  return response
}

export const simplifyLesson = async (content: string) => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Simplify this lesson in plain simple English: ${content}`,
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty simplified lesson',
      'GROQ_EMPTY_SIMPLIFY_RESPONSE'
    )
  }

  return response
}

export const generateCodeExample = async (
  topic: string,
  language: string
) => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Generate a clear code example for ${topic} in ${language}`,
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty code example',
      'GROQ_EMPTY_CODE_EXAMPLE'
    )
  }

  return response
}

// ============================================================
// GROQ LLAMA 3.1 8B — FAST SIMPLE TASKS
// ============================================================

export const quickSummary = async (content: string) => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Summarize this in 2-3 sentences: ${content}`,
      },
    ],
    'llama-3.1-8b-instant'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty summary',
      'GROQ_EMPTY_SUMMARY'
    )
  }

  return response
}

export const generateTopicTags = async (content: string) => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Extract 5 relevant tags from this content as JSON array: ${content}`,
      },
    ],
    'llama-3.1-8b-instant'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned empty topic tags',
      'GROQ_EMPTY_TOPIC_TAGS'
    )
  }

  return response
}
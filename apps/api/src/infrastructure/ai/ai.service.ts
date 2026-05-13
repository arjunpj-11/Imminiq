import { z } from 'zod'

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

  const parsed = JSON.parse(cleaned)

  return schema.parse(parsed)
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
// GEMINI / CEREBRAS — COMPLEX GENERATION TASKS
// ============================================================

/**
 * Used by onboarding flow.
 *
 * Generates only roadmap structure:
 * - tracker title
 * - top-level roadmap topics
 * - nested child nodes
 *
 * Does NOT generate:
 * - lessons
 * - explanations
 * - code examples
 * - visualizations
 * - resources
 */
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

Examples:
- title: "Closures and lexical scope"
  description: "Understand how functions retain outer scope and how closures appear in real interview traps."

- title: "Interview Q: Explain event loop ordering"
  description: "Be able to predict sync, microtask, and macrotask execution order."

============================================================
CONTENT PRIORITY
============================================================

Prioritize:
1. Complete coverage
2. Strong sequence
3. Interview relevance
4. Real-world usefulness
5. Specificity over generic wording

If the user chooses beginner:
- Still create the full zero-to-hero roadmap.
- Begin more gently and include prerequisites.
- Do not reduce the final roadmap into a beginner-only mini syllabus.

If the user chooses intermediate:
- Include refresh foundations but move faster into applied and advanced depth.

If the user chooses advanced:
- Keep foundations compact but still include them as checkpoints.
- Expand advanced internals, architecture, performance, edge cases, and interviews.

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

/**
 * Used after roadmap generation is completed.
 *
 * Evaluates the full generated roadmap and returns:
 * - score
 * - grade
 * - summary
 * - missing topics with suggested tracker placement
 */
export const evaluateRoadmap = async (
  roadmap: unknown
): Promise<RoadmapEvaluation> => {
  const prompt = `
You are a strict expert curriculum evaluator, interview mentor, and learning-path reviewer.

Your task is to critically evaluate this AI-generated roadmap.

The roadmap must be judged as a COMPLETE ZERO-TO-HERO MASTER ROADMAP.

============================================================
EVALUATION TARGET
============================================================

A strong roadmap should:
- take a learner from beginner foundations to advanced mastery
- be sufficiently detailed, not just a short overview
- be logically sequenced
- include practical learning steps
- include interview-readiness where relevant
- include common interview questions, comparisons, practice tasks, edge cases, and misconceptions where relevant
- include production-minded concepts where relevant
- feel suitable as a serious long-term tracker

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
- Do not return strengths, weaknesses, verdict, or improvementSuggestions.
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

/**
 * Legacy/general roadmap text generator.
 * Keep this only if you use it somewhere else outside onboarding.
 *
 * For onboarding flow, use generateRoadmapStructure instead.
 */
export const generateRoadmap = (
  goal: string,
  level: string
) =>
  geminiChat(
    `Generate a detailed learning roadmap for ${goal} at ${level} level`,
    'You are an expert learning path designer.'
  )

/**
 * Future feature:
 * Generate a full lesson only when the user enters a roadmap node.
 * Not used during onboarding generation.
 */
export const generateLesson = (topic: string) =>
  geminiChat(
    `Generate a detailed lesson for: ${topic}`,
    'You are an expert educator.'
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

export const generateDashboardInsights = (
  userData: string
) =>
  geminiChat(
    `Generate personalized learning insights for this user: ${userData}`,
    'You are a personalized learning coach.'
  )

// ============================================================
// GROQ LLAMA 3.3 70B — CONVERSATIONAL TASKS
// ============================================================

export const chatWithTutor = (
  messages: {
    role: 'user' | 'assistant' | 'system'
    content: string
  }[]
) =>
  groqChat(
    messages,
    'llama-3.3-70b-versatile'
  )

export const explainTopic = (topic: string) =>
  groqChat(
    [
      {
        role: 'user',
        content: `Explain this topic clearly with examples: ${topic}`,
      },
    ],
    'llama-3.3-70b-versatile'
  )

export const explainELI5 = (topic: string) =>
  groqChat(
    [
      {
        role: 'user',
        content: `Explain this like I am 5 years old: ${topic}`,
      },
    ],
    'llama-3.3-70b-versatile'
  )

export const generateMockQuestions = (
  topic: string,
  count: number
) =>
  groqChat(
    [
      {
        role: 'user',
        content: `Generate ${count} MCQ questions for: ${topic}. Return as JSON array.`,
      },
    ],
    'llama-3.3-70b-versatile'
  )

export const reviewCode = (
  code: string,
  language: string
) =>
  groqChat(
    [
      {
        role: 'user',
        content: `Review this ${language} code and suggest improvements: ${code}`,
      },
    ],
    'llama-3.3-70b-versatile'
  )

export const optimizeCode = (
  code: string,
  language: string
) =>
  groqChat(
    [
      {
        role: 'user',
        content: `Optimize this ${language} code: ${code}`,
      },
    ],
    'llama-3.3-70b-versatile'
  )

export const simplifyLesson = (content: string) =>
  groqChat(
    [
      {
        role: 'user',
        content: `Simplify this lesson in plain simple English: ${content}`,
      },
    ],
    'llama-3.3-70b-versatile'
  )

export const generateCodeExample = (
  topic: string,
  language: string
) =>
  groqChat(
    [
      {
        role: 'user',
        content: `Generate a clear code example for ${topic} in ${language}`,
      },
    ],
    'llama-3.3-70b-versatile'
  )

// ============================================================
// GROQ LLAMA 3.1 8B — FAST SIMPLE TASKS
// ============================================================

export const quickSummary = (content: string) =>
  groqChat(
    [
      {
        role: 'user',
        content: `Summarize this in 2-3 sentences: ${content}`,
      },
    ],
    'llama-3.1-8b-instant'
  )

export const generateTopicTags = (content: string) =>
  groqChat(
    [
      {
        role: 'user',
        content: `Extract 5 relevant tags from this content as JSON array: ${content}`,
      },
    ],
    'llama-3.1-8b-instant'
  )
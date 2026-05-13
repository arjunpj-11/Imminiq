// apps/api/src/infrastructure/ai/ai.service.ts

import { z } from 'zod'
import { geminiChat } from './gemini.client'
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
// GEMINI — COMPLEX GENERATION TASKS
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

  const response = await geminiChat(
    prompt,
    'You are an elite curriculum architect. Return strict valid JSON only. Build complete zero-to-hero master roadmaps with interview depth.'
  )

  return parseAIJson(
    response,
    generatedRoadmapStructureSchema
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

export const evaluateRoadmap = (roadmap: string) =>
  geminiChat(
    `Evaluate this roadmap for completeness and accuracy: ${roadmap}`,
    'You are a curriculum quality reviewer.'
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
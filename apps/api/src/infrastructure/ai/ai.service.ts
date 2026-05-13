// apps/api/src/infrastructure/ai/ai.service.ts

import { z } from 'zod'
import { geminiChat } from './gemini.client'
import { groqChat } from './groq.client'

// ============================================================
// SHARED ROADMAP STRUCTURE TYPES
// ============================================================

export type RoadmapNestedNode = {
  title: string
  order: number
  children: RoadmapNestedNode[]
}

const roadmapNestedNodeSchema: z.ZodType<RoadmapNestedNode> =
  z.lazy(() =>
    z.object({
      title: z.string().trim().min(1),
      order: z.number().int().min(1),
      children: z.array(roadmapNestedNodeSchema).default([]),
    })
  )

const roadmapTopicSchema = z.object({
  title: z.string().trim().min(1),
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
You are an expert curriculum architect.

Generate ONLY the STRUCTURE of a learning roadmap.

Do NOT generate:
- explanations
- lesson content
- code examples
- notes
- resources
- practice exercises
- quizzes
- visualizations

The product will generate lesson content later only when a user opens a specific roadmap node.

User Input:
- Topic / Stack: ${topic}
- Goal: ${goal || 'Build strong practical understanding'}
- Current Level: ${level}

The roadmap should be hierarchical.

Example idea:
If topic is MERN Stack:
- JavaScript
  - Fundamentals
    - Variables and Data Types
    - Operators
    - Functions
  - Advanced JavaScript
    - Closures
    - Event Loop
    - Async Programming
- Node.js
  - Runtime Fundamentals
  - Modules and Packages
  - Backend Patterns
- Express.js
  - Routing
  - Middleware
  - Error Handling
- MongoDB
  - CRUD Operations
  - Schema Design
  - Aggregation
- React
  - Components
  - Hooks
  - State Management

Return ONLY valid JSON.
No markdown.
No comments.
No extra explanation.

Use this exact JSON structure:

{
  "title": "string",
  "description": "short roadmap overview, maximum 2 sentences",
  "topics": [
    {
      "title": "Main Topic Title",
      "order": 1,
      "children": [
        {
          "title": "Subtopic Title",
          "order": 1,
          "children": [
            {
              "title": "Nested Subtopic Title",
              "order": 1,
              "children": []
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- Generate 5 to 12 top-level main topics depending on the subject.
- Each top-level topic should contain meaningful subtopics.
- Use 1 to 3 nested levels below each main topic where useful.
- Leaf nodes must always have "children": [].
- Keep all titles concise and professional.
- Order topics from foundational to advanced.
- Make the roadmap practical, interview-relevant, and logically structured.
- Do not generate educational content beyond the roadmap structure.
`

  const response = await geminiChat(
    prompt,
    'You are an expert curriculum architect who returns strict valid JSON only.'
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
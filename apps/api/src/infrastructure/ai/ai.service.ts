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
export type LessonVisualizationResult = {
  html: string
  visualTitle: string
  visualDescription: string
}

interface VisualizationInput {
  title: string
  summary: string
  explanation: string
  lessonType: string
  tags: string[]
  difficulty: string
  codeExample?: { code?: string; language?: string }
}
 

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
// TRACKER VERIFICATION TYPES
// ============================================================

const trackerTopicVerificationSchema = z.object({
  verified: z.boolean(),
  message: z.string().trim().min(1),
  polishedTitle: z.string().trim().min(1),
  polishedDescription: z.string().trim().default(''),
})

const trackerSubtopicVerificationSchema = z.object({
  verified: z.boolean(),
  message: z.string().trim().min(1),
  polishedTitle: z.string().trim().min(1),
  polishedDescription: z.string().trim().default(''),
})

export type TrackerTopicVerificationResult = z.infer<
  typeof trackerTopicVerificationSchema
>

export type TrackerSubtopicVerificationResult = z.infer<
  typeof trackerSubtopicVerificationSchema
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

// Replace the buildVisualizationPrompt function in ai.service.ts with this:

function buildVisualizationPrompt(lesson: VisualizationInput): string {
  const truncatedExplanation = lesson.explanation.slice(0, 2000)
  const codeSnippet = lesson.codeExample?.code
    ? `\nCode Example (${lesson.codeExample.language}):\n${lesson.codeExample.code.slice(0, 500)}`
    : ''

  return `You are an expert educational animator. Your job is to create a self-contained interactive HTML canvas visualization that teaches ONE specific concept through clear, step-by-step visual flow.

════════════════════════════════════════
LESSON TO VISUALIZE
════════════════════════════════════════
Title: ${lesson.title}
Type: ${lesson.lessonType}
Difficulty: ${lesson.difficulty}
Tags: ${lesson.tags.join(', ')}
Summary: ${lesson.summary}
${codeSnippet}

Explanation:
${truncatedExplanation}

════════════════════════════════════════
CRITICAL RULE — READ FIRST
════════════════════════════════════════
You must visualize THE EXACT NAMED CONCEPT in the lesson title above.

DO NOT generate:
- Generic floating nodes labeled "data" or "node"
- Random particle systems
- Abstract graph networks with no meaning
- Placeholder boxes with no labels

You MUST generate a visualization that a student could pause on and say
"I now understand ${lesson.title}" — not just "I saw a pretty animation."

════════════════════════════════════════
HOW TO PICK THE RIGHT VISUALIZATION
════════════════════════════════════════
Read the lesson title and tags, then choose the most educational format:

FLOW / PROCESS concepts (DNS, HTTP, OAuth, TCP, auth flows, event loop, garbage collection, etc.)
→ Draw labeled BOXES connected by animated ARROWS showing each step in sequence.
→ Animate the flow from left-to-right or top-to-bottom one step at a time.
→ Label every box and every arrow clearly. Show state changes.
→ Example for DNS: Browser → Recursive Resolver → Root NS → TLD NS → Authoritative NS → IP returned
→ Example for HTTP: Client → [GET /path] → Server → [200 OK + body] → Client

SORTING / SEARCHING algorithms (bubble sort, quicksort, binary search, etc.)
→ Draw an array of labeled bars or blocks.
→ Animate comparisons (highlight in yellow), swaps (swap with motion), and final sorted state (green).
→ Show step counter, comparisons counter, and current operation as text on canvas.

DATA STRUCTURES (linked list, tree, stack, queue, hash table, graph, heap, etc.)
→ Draw the actual structure with labeled nodes and edges.
→ Animate INSERT, DELETE, SEARCH operations visually with highlighted steps.
→ Show pointers as arrows. Show null as a ∅ symbol.

RECURSION / CALL STACK
→ Draw stack frames appearing from the bottom, stacking up, then resolving back down.
→ Label each frame with the function name and current argument value.
→ Show the return value bubbling back up.

MEMORY / POINTERS / REFERENCES
→ Draw a memory layout with address blocks (e.g. 0x001, 0x002...).
→ Show variables pointing to addresses with arrows.
→ Animate allocation, assignment, and deallocation.

OS CONCEPTS (scheduling, paging, threading, semaphores, etc.)
→ Draw the components (CPU, queue, memory pages, processes) as labeled rectangles.
→ Animate transitions: ready → running → waiting → terminated with arrows and timelines.

MATH / ALGORITHMS (Big-O, Fourier, probability, sorting complexity, etc.)
→ Plot a clean graph with labeled axes.
→ Draw multiple curves in different colors (e.g. O(n), O(n²), O(log n)).
→ Animate a moving point showing growth.

DESIGN PATTERNS / ARCHITECTURE (MVC, observer, factory, microservices, etc.)
→ Draw the components as labeled boxes.
→ Animate messages or data flowing between components with labeled arrows.
→ Show a concrete example of the pattern in action (e.g. user clicks → controller → model → view).

DATABASE CONCEPTS (indexing, joins, transactions, ACID, etc.)
→ Draw tables as grids with real sample data (not "data1", "data2").
→ Animate the operation: highlight rows being joined, index pointer jumping to row, transaction locking.

════════════════════════════════════════
LABEL QUALITY RULES
════════════════════════════════════════
- Every box, node, arrow, and step MUST have a real descriptive label — never "data", "node", "item", "value" alone.
- Use actual terminology from the lesson: e.g. "Recursive Resolver", "Hash Bucket 3", "Stack Frame: fib(3)", "Page Table Entry".
- Numbers shown on canvas must mean something (not random).
- Show a step title at the top or side that describes what is currently happening: e.g. "Step 2: Root NS returns TLD server address".

════════════════════════════════════════
ANIMATION RULES
════════════════════════════════════════
- Use requestAnimationFrame. Target 60fps.
- Animate one logical step at a time with a pause between steps so the user can follow.
- After the last step, loop back to the beginning with a brief "Restarting..." pause.
- Highlight the active element in a bright accent color (yellow or white).
- Completed elements should turn a calm color (green or teal).
- Pending elements should be dim (grey or dark).

════════════════════════════════════════
CONTROLS
════════════════════════════════════════
Add a fixed overlay panel at bottom-left with:
- A speed slider (label: "Speed") that controls animation step duration.
- One additional control relevant to the concept (e.g. array size for sorting, number of processes for scheduling, node count for trees).
- Style: dark semi-transparent background (#111 / 0.85 opacity), rounded corners, white labels, colored slider track.

════════════════════════════════════════
VISUAL STYLE
════════════════════════════════════════
- Background: #0a0a0a
- Font: monospace throughout — labels, stats, titles
- Color palette: pick ONE accent color family matching the concept:
    networking/HTTP → cyan (#00bcd4 family)
    algorithms/sorting → green (#4caf50 family)
    memory/systems → orange (#ff9800 family)
    math/recursion → purple (#9c27b0 family)
    databases → blue (#2196f3 family)
    design patterns → pink (#e91e63 family)
- Canvas: 100vw × 100vh, resize on window resize
- Top-left label: "⬢ ${lesson.title}" in small monospace text, faded

════════════════════════════════════════
OUTPUT RULES
════════════════════════════════════════
- Return ONE completely self-contained HTML file.
- No external libraries, no CDN imports. Vanilla JS only.
- Begin the response with <!DOCTYPE html> — nothing before it.
- No markdown fences, no explanation, no comments outside the HTML.`
}
 
// 2. Add this function at the bottom of ai.service.ts (before the closing line):
 
// ============================================================
// GEMINI — LESSON VISUALIZATION GENERATION
// ============================================================
 
export const generateLessonVisualization = async (
  lesson: VisualizationInput
): Promise<LessonVisualizationResult> => {
  const system =
    'You are an expert educational visualization engineer. Return only a complete self-contained HTML file starting with <!DOCTYPE html>. No markdown, no explanation, no code fences.'

  const rawText = await heavyAIChatWithFallback(
    buildVisualizationPrompt(lesson),
    system,
    cerebrasRoadmapStructureChat  // cerebras as final fallback
  )

  if (!rawText) {
    throw new ApiError(502, 'AI returned an empty response', 'VISUALIZATION_EMPTY_RESPONSE')
  }

  let html = rawText
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const doctypeIndex = html.search(/<!doctype html>/i)
  if (doctypeIndex > 0) html = html.slice(doctypeIndex)

  if (!html.toLowerCase().includes('<canvas')) {
    throw new ApiError(502, 'AI did not return a canvas visualization. Please try regenerating.', 'VISUALIZATION_NO_CANVAS')
  }

  return {
    html,
    visualTitle: `${lesson.title} — Visual`,
    visualDescription: `Interactive AI visualization of "${lesson.title}"`,
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

Return ONLY valid JSON using this exact structure:

{
  "title": "string",
  "summary": "short overview",
  "explanation": "clear detailed lesson explanation in simple English",
  "insight": "one helpful analogy or mental model",
  "lessonType": "concept",
  "compilerRuntime": null,
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

============================================================
LESSON TYPE RULE
============================================================

- "coding"        → JavaScript, TypeScript, Node.js, Express, MongoDB queries, DSA, algorithms, implementation, debugging, syntax
- "interview"     → interview question / explanation lessons
- "system_design" → architecture, scaling, distributed systems, database design, API design
- "theory"        → pure conceptual or theoretical lessons with no code
- "concept"       → general non-code learning concepts

============================================================
COMPILER RUNTIME RULE
============================================================

Set "compilerRuntime" to one of these exact string values if the learner needs to
execute code in a terminal to understand the lesson. Otherwise set it to null.

Allowed runtime values:
- "javascript" → JS syntax, Node.js, Express, async/await, closures, scope, hoisting,
                 var/let/const, arrays, objects, promises, loops, callbacks, fetch,
                 DOM manipulation, MongoDB query logic, debugging, DSA in JS
- "typescript" → TypeScript-specific lessons (types, interfaces, generics, decorators)
- "python"     → any Python lesson
- "c++"        → any C++ lesson
- "c"          → any C lesson
- "java"       → any Java lesson
- null         → React, JSX, Vue, Angular, Svelte, or any UI/component framework
                 (Piston is a terminal runtime — it CANNOT render UI or JSX),
                 system design, architecture, pure theory, comparison-only lessons,
                 interview Q&A with no runnable code, HTTP concepts, CSS, HTML

CRITICAL RULES:
- React/JSX lessons MUST always be null. Components cannot run in a terminal.
- Vue, Angular, Svelte MUST always be null. Same reason.
- If the lesson involves writing and running actual terminal-executable code, set the runtime.
- If the lesson is conceptual, comparison-based, or UI-framework-based, use null.

============================================================
CODE EXAMPLE RULE
============================================================

- If compilerRuntime is not null: provide a clear, runnable codeExample.code.
- If compilerRuntime is null: codeExample.code may be empty or contain a non-runnable
  pseudocode / illustration snippet (it will be shown as a static block, not executed).

============================================================
PRACTICE TASK RULE
============================================================

- If compilerRuntime is not null:
  - practiceTask.description must clearly state the coding challenge.
  - practiceTask.starterCode must include incomplete starter code the learner can edit and run.
  - practiceTask.expectedOutput must be the exact stdout expected from a correct solution.
  - practiceTask.expectedAnswer must be an empty string.

- If compilerRuntime is null:
  - practiceTask.description must be a written question or problem the learner answers by typing.
  - practiceTask.expectedAnswer must contain a reference answer for verification.
  - practiceTask.starterCode and practiceTask.expectedOutput must be empty strings.

============================================================
QUALITY RULES
============================================================

- Make the lesson practical and interview-useful.
- Explanation should be detailed but readable.
- Avoid vague generic content.
- Do not use markdown fences inside any string value.
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

  return {
    ...lesson,
    compilerRuntime: lesson.compilerRuntime ?? null,
  }
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

const lessonPracticeQuestionsSchema = z.object({
  questions: z.array(z.string().trim().min(1)).min(1).max(10),
})

export type LessonPracticeQuestionsAIResult = z.infer<
  typeof lessonPracticeQuestionsSchema
>

export const generateLessonPracticeQuestions = async (input: {
  lessonTitle: string
  lessonSummary: string
  lessonExplanation: string
  count?: number
}): Promise<LessonPracticeQuestionsAIResult> => {
  const count = input.count || 5

  const response = await groqChat(
    [
      {
        role: 'system',
        content:
          'You are Scribe AI, an expert lesson practice question generator. Return only strict valid JSON. No markdown.',
      },
      {
        role: 'user',
        content: `
Generate ${count} more practice questions for this lesson.

Lesson title:
${input.lessonTitle}

Lesson summary:
${input.lessonSummary}

Lesson explanation:
${input.lessonExplanation}

Rules:
- Questions must be specific to this lesson.
- Include conceptual, previous-year style, interview-style, application, and math-style questions where relevant.
- Use readable math notation where needed, like x^2, H_2O, a_n, \\frac{a}{b}, or $$E = mc^2$$.
- Do not include answers.
- Return only JSON.

Return ONLY valid JSON using this exact structure:

{
  "questions": ["question 1", "question 2"]
}
        `.trim(),
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned empty lesson practice questions',
      'GROQ_EMPTY_LESSON_PRACTICE_QUESTIONS'
    )
  }

  return parseAIJson(response, lessonPracticeQuestionsSchema)
}

export const generateLessonQuestionSolution = async (input: {
  lessonTitle: string
  lessonExplanation: string
  question: string
}): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'system',
        content:
          'You are Scribe AI, a clear and supportive lesson solution tutor.',
      },
      {
        role: 'user',
        content: `
Generate a clear solution/answer for this question.

Lesson title:
${input.lessonTitle}

Lesson explanation:
${input.lessonExplanation}

Question:
${input.question}

Rules:
- Answer in simple English.
- Make it useful for interview/exam preparation.
- Include key points the user should remember.
- If math is involved, format equations clearly using:
  - x^2 for powers
  - a_n for subscripts
  - \\frac{a}{b} for fractions
  - $$equation$$ for important standalone equations
- If relevant, include a short example.
        `.trim(),
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned empty question solution',
      'GROQ_EMPTY_QUESTION_SOLUTION'
    )
  }

  return response.trim()
}

export const chatWithLessonQuestionSolutionDoubt = async (input: {
  lessonTitle: string
  lessonExplanation: string
  question: string
  solution: string
  messages: {
    role: 'user' | 'assistant'
    content: string
  }[]
}): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'system',
        content:
          'You are Scribe AI, a helpful tutor answering doubts about a saved generated solution.',
      },
      {
        role: 'user',
        content: `
Lesson:
${input.lessonTitle}

Lesson explanation:
${input.lessonExplanation}

Question:
${input.question}

Saved solution:
${input.solution}

The learner is asking follow-up doubts about this solution.
Answer clearly and simply. Do not regenerate the whole solution unless needed.
        `.trim(),
      },
      ...input.messages,
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned empty solution doubt response',
      'GROQ_EMPTY_SOLUTION_DOUBT_RESPONSE'
    )
  }

  return response.trim()
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
// GROQ — TRACKER TOPIC / SUBTOPIC VERIFICATION
// ============================================================

export const verifyTrackerTopic = async (input: {
  trackerTitle: string
  topicTitle: string
  topicDescription: string
  existingTopics: { id: string; title: string; description: string }[]
}): Promise<TrackerTopicVerificationResult> => {
  const existingList = input.existingTopics.length
    ? input.existingTopics
        .map((t, i) => `${i + 1}. ${t.title}${t.description ? ` — ${t.description}` : ''}`)
        .join('\n')
    : 'None yet'

  const response = await groqChat(
    [
      {
        role: 'system',
        content:
          'You are a strict curriculum reviewer for Imminiq. Return only strict valid JSON. No markdown. No extra explanation.',
      },
      {
        role: 'user',
        content: `
A user wants to add a new topic to their learning tracker.

Tracker title:
${input.trackerTitle}

New topic title:
${input.topicTitle}

New topic description:
${input.topicDescription || 'Not provided'}

Existing topics already in this tracker:
${existingList}

Your task:
- Decide whether this new topic genuinely belongs in this tracker.
- Reject it if it is off-topic, too vague, completely duplicate, or clearly does not fit the tracker's subject.
- Approve it if it is a relevant, meaningful topic that adds value to this learning roadmap.
- Be practical: slight overlaps are fine as long as the new topic has its own distinct value.

Return ONLY valid JSON using this exact structure:

{
  "verified": true,
  "message": "Short explanation of why this topic was approved or rejected.",
  "polishedTitle": "Fix obvious typos only (e.g. 'Javascrpt' → 'JavaScript'). Otherwise return the title exactly as given.",
  "polishedDescription": "One clear sentence describing what the learner will cover. If user left it empty, write one based on the title and tracker context."
}
        `.trim(),
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty topic verification response',
      'GROQ_EMPTY_TOPIC_VERIFICATION_RESPONSE'
    )
  }

  return parseAIJson(response, trackerTopicVerificationSchema)
}

export const verifyTrackerSubtopic = async (input: {
  trackerTitle: string
  topicTitle: string
  topicDescription: string
  subtopicTitle: string
  subtopicDescription: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  existingSubtopics: {
    id: string
    title: string
    description: string
    difficulty: string
  }[]
}): Promise<TrackerSubtopicVerificationResult> => {
  const existingList = input.existingSubtopics.length
    ? input.existingSubtopics
        .map(
          (s, i) =>
            `${i + 1}. ${s.title}${s.difficulty ? ` [${s.difficulty}]` : ''}${s.description ? ` — ${s.description}` : ''}`
        )
        .join('\n')
    : 'None yet'

  const response = await groqChat(
    [
      {
        role: 'system',
        content:
          'You are a strict curriculum reviewer for Imminiq. Return only strict valid JSON. No markdown. No extra explanation.',
      },
      {
        role: 'user',
        content: `
A user wants to add a new subtopic (lesson) under a topic in their learning tracker.

Tracker title:
${input.trackerTitle}

Parent topic:
${input.topicTitle}${input.topicDescription ? ` — ${input.topicDescription}` : ''}

New subtopic title:
${input.subtopicTitle}

New subtopic description:
${input.subtopicDescription || 'Not provided'}

Difficulty:
${input.difficulty}

Existing subtopics already under this topic:
${existingList}

Your task:
- Decide whether this new subtopic genuinely belongs under this specific topic.
- Reject it if it is off-topic for the parent topic, too vague, a clear duplicate of an existing subtopic, or does not add learning value.
- Approve it if it is a relevant, distinct, and meaningful lesson that fits logically under the parent topic.
- Be practical: minor wording differences from existing subtopics are fine if the learning content is clearly distinct.

Return ONLY valid JSON using this exact structure:

{
  "verified": true,
  "message": "Short explanation of why this subtopic was approved or rejected.",
  "polishedTitle": "Fix obvious typos only. Otherwise return the title exactly as given.",
  "polishedDescription": "One clear sentence describing what the learner will understand or practice in this subtopic."
}
        `.trim(),
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty subtopic verification response',
      'GROQ_EMPTY_SUBTOPIC_VERIFICATION_RESPONSE'
    )
  }

  return parseAIJson(response, trackerSubtopicVerificationSchema)
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
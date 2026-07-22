export const LESSON_GENERATION_SYSTEM_PROMPT =
  'You are Scribe AI, an expert programming tutor inside Imminiq. Return only strict valid JSON. No markdown. No extra explanation.';

export const buildLessonGenerationPrompt = (input: {
  trackerTitle: string;
  topicTitle?: string;
  subtopicTitle: string;
  subtopicDescription?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  preferredLanguage?: string;
}): string =>
  `
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

Preferred content language:
${input.preferredLanguage || 'English'}

Write all learner-facing explanations, summaries, insights, and practice instructions in the preferred content language. Keep code, API names, and established technical terms unchanged where translation would reduce clarity.

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
  "difficulty": "beginner"
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
`.trim();

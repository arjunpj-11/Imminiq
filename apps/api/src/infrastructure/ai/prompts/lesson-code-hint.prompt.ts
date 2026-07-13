export const LESSON_CODE_HINT_SYSTEM_PROMPT =
  'You are Scribe AI, a supportive coding tutor. Return only strict valid JSON. No markdown.';

export const buildLessonCodeHintPrompt = (input: {
  lessonTitle: string;
  practiceTitle: string;
  practiceDescription: string;
  expectedOutput: string;
  sourceCode: string;
  actualOutput?: string;
  errorOutput?: string;
  hintCount: number;
  revealIssue: boolean;
}): string =>
  `
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
  input.revealIssue
    ? 'The learner already used 3 hints. Now directly reveal the exact issue in the code and explain how to fix it.'
    : 'Give only one useful hint. Do not reveal the full answer or fixed code.'
}

Return ONLY valid JSON using this exact structure:

{
  "mode": "${input.revealIssue ? 'issue' : 'hint'}",
  "title": "short title",
  "explanation": "clear explanation"
}
`.trim();

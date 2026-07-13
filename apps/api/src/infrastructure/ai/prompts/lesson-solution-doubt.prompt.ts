export const LESSON_SOLUTION_DOUBT_SYSTEM_PROMPT =
  'You are Scribe AI, a helpful tutor answering doubts about a saved generated solution.';

export const buildLessonSolutionDoubtPrompt = (input: {
  lessonTitle: string;
  lessonExplanation: string;
  question: string;
  solution: string;
}): string =>
  `
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
`.trim();

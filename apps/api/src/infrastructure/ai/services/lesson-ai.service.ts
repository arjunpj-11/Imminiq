import { dependencyFailure } from '../../../shared/errors/service.error';

import { generatedLessonSchema, type GeneratedLesson } from '../ai.schemas';
import { parseAIJson } from '../ai-json.parser';
import {
  economyAIChatWithFallback as groqChat,
  economyAIStructuredWithFallback,
} from '../ai-fallback.helper';
import {
  buildLessonGenerationPrompt,
  LESSON_GENERATION_SYSTEM_PROMPT,
} from '../prompts/lesson-generation.prompt';
import { buildLessonTutorSystemPrompt } from '../prompts/lesson-tutor.prompt';

// ============================================================
// GROQ — LESSON GENERATION
// ============================================================

export const generateLesson = async (input: {
  trackerTitle: string;
  topicTitle?: string;
  subtopicTitle: string;
  subtopicDescription?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}): Promise<GeneratedLesson> => {
  const lesson = await economyAIStructuredWithFallback(
    [
      {
        role: 'system',
        content: LESSON_GENERATION_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: buildLessonGenerationPrompt(input),
      },
    ],
    (response) => parseAIJson(response, generatedLessonSchema),
    'quality',
    'lesson_generation',
    { operation: 'lesson-generation', groqMaxTokens: 8192, temperature: 0.4 }
  );

  return {
    ...lesson,
    compilerRuntime: lesson.compilerRuntime ?? null,
  };
};

export const chatWithLessonTutor = async (input: {
  lessonTitle: string;
  lessonContent: string;
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }[];
}): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'system',
        content: buildLessonTutorSystemPrompt({
          lessonTitle: input.lessonTitle,
          lessonContent: input.lessonContent,
        }),
      },
      ...input.messages,
    ],
    'quality',
    'ai_tutoring',
    { operation: 'lesson-tutor-chat' }
  );

  if (!response) {
    throw dependencyFailure('Groq returned an empty tutor response', 'GROQ_EMPTY_TUTOR_RESPONSE');
  }

  return response;
};

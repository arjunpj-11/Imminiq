import { dependencyFailure } from '../../../shared/errors/service.error';
import { z } from 'zod';

import {
  economyAIChatWithFallback as groqChat,
  economyAIStructuredWithFallback,
} from '../ai-fallback.helper';
import { parseAIJson } from '../ai-json.parser';
import {
  buildDashboardInsightPrompt,
  DASHBOARD_INSIGHT_SYSTEM_PROMPT,
} from '../prompts/dashboard-insight.prompt';

// ============================================================
// LEGACY / GENERAL AI HELPERS
// ============================================================

export const generateRoadmap = (goal: string, level: string) =>
  groqChat(
    [
      { role: 'system', content: 'You are an expert learning path designer.' },
      {
        role: 'user',
        content: `Generate a detailed learning roadmap for ${goal} at ${level} level`,
      },
    ],
    'quality',
    'roadmap_generation',
    { operation: 'legacy-roadmap-generation' }
  );

export const detectMissingTopics = (roadmap: string, targetRole: string) =>
  groqChat(
    [
      { role: 'system', content: 'You are a curriculum gap analyst.' },
      {
        role: 'user',
        content: `Compare this roadmap against ${targetRole} requirements and list missing topics: ${roadmap}`,
      },
    ],
    'quality',
    'roadmap_evaluation',
    { operation: 'missing-topic-detection' }
  );

export const analyzeTestPerformance = (results: string) =>
  groqChat(
    [
      { role: 'system', content: 'You are a learning analytics expert.' },
      {
        role: 'user',
        content: `Analyze this test performance and identify weak areas: ${results}`,
      },
    ],
    'quality',
    'mock_test_evaluation',
    { operation: 'test-performance-analysis' }
  );

export const generateDashboardInsights = async (userData: string): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'system',
        content: DASHBOARD_INSIGHT_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: buildDashboardInsightPrompt(userData),
      },
    ],
    'fast',
    'dashboard_insights',
    { operation: 'dashboard-insights' }
  );

  return (
    response || 'Focus on completing one small lesson today to keep your learning momentum strong.'
  );
};

// ============================================================
// GROQ LLAMA 3.3 70B — CONVERSATIONAL TASKS
// ============================================================

export const chatWithTutor = async (
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }[]
): Promise<string> => {
  const response = await groqChat(messages, 'quality', 'ai_tutoring', {
    operation: 'general-tutor-chat',
  });

  if (!response) {
    throw dependencyFailure('Groq returned an empty chat response', 'GROQ_EMPTY_CHAT_RESPONSE');
  }

  return response;
};

export const explainTopic = async (topic: string): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Explain this topic clearly with examples: ${topic}`,
      },
    ],
    'quality',
    'ai_tutoring',
    { operation: 'topic-explanation' }
  );

  if (!response) {
    throw dependencyFailure(
      'Groq returned an empty topic explanation',
      'GROQ_EMPTY_TOPIC_EXPLANATION'
    );
  }

  return response;
};

export const explainELI5 = async (topic: string): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Explain this like I am 5 years old: ${topic}`,
      },
    ],
    'quality',
    'ai_tutoring',
    { operation: 'eli5-explanation' }
  );

  if (!response) {
    throw dependencyFailure('Groq returned an empty ELI5 explanation', 'GROQ_EMPTY_ELI5_RESPONSE');
  }

  return response;
};

export const generateMockQuestions = async (topic: string, count: number): Promise<string> => {
  return economyAIStructuredWithFallback(
    [
      {
        role: 'user',
        content: `Generate ${count} MCQ questions for: ${topic}. Return as JSON array.`,
      },
    ],
    (response) => JSON.stringify(parseAIJson(response, z.array(z.unknown()).length(count))),
    'quality',
    'mock_test_generation',
    { operation: 'legacy-mock-question-generation', groqMaxTokens: 4096, temperature: 0.5 }
  );
};

export const reviewCode = async (code: string, language: string): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Review this ${language} code and suggest improvements: ${code}`,
      },
    ],
    'quality',
    'other',
    { operation: 'code-review' }
  );

  if (!response) {
    throw dependencyFailure('Groq returned an empty code review', 'GROQ_EMPTY_CODE_REVIEW');
  }

  return response;
};

export const optimizeCode = async (code: string, language: string): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Optimize this ${language} code: ${code}`,
      },
    ],
    'quality',
    'other',
    { operation: 'code-optimization' }
  );

  if (!response) {
    throw dependencyFailure(
      'Groq returned an empty optimized code response',
      'GROQ_EMPTY_OPTIMIZE_RESPONSE'
    );
  }

  return response;
};

export const simplifyLesson = async (content: string): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Simplify this lesson in plain simple English: ${content}`,
      },
    ],
    'quality',
    'other',
    { operation: 'lesson-simplification' }
  );

  if (!response) {
    throw dependencyFailure(
      'Groq returned an empty simplified lesson',
      'GROQ_EMPTY_SIMPLIFY_RESPONSE'
    );
  }

  return response;
};

export const generateCodeExample = async (topic: string, language: string): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Generate a clear code example for ${topic} in ${language}`,
      },
    ],
    'quality',
    'other',
    { operation: 'code-example-generation' }
  );

  if (!response) {
    throw dependencyFailure('Groq returned an empty code example', 'GROQ_EMPTY_CODE_EXAMPLE');
  }

  return response;
};

// ============================================================
// GROQ LLAMA 3.1 8B — FAST SIMPLE TASKS
// ============================================================

export const quickSummary = async (content: string): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Summarize this in 2-3 sentences: ${content}`,
      },
    ],
    'fast',
    'other',
    { operation: 'quick-summary' }
  );

  if (!response) {
    throw dependencyFailure('Groq returned an empty summary', 'GROQ_EMPTY_SUMMARY');
  }

  return response;
};

export const generateTopicTags = async (content: string): Promise<string> => {
  return economyAIStructuredWithFallback(
    [
      {
        role: 'user',
        content: `Extract 5 relevant tags from this content as JSON array: ${content}`,
      },
    ],
    (response) => JSON.stringify(parseAIJson(response, z.array(z.string()).length(5))),
    'fast',
    'other',
    { operation: 'topic-tag-generation', temperature: 0.2 }
  );
};

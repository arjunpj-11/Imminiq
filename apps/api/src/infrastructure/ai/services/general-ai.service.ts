import { dependencyFailure } from '../../../shared/errors/service.error';

import { economyAIChatWithFallback as groqChat } from '../ai-fallback.helper';
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
    'roadmap_generation'
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
    'roadmap_evaluation'
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
    'mock_test_evaluation'
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
    'dashboard_insights'
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
  const response = await groqChat(messages, 'quality', 'ai_tutoring');

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
    'ai_tutoring'
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
    'ai_tutoring'
  );

  if (!response) {
    throw dependencyFailure('Groq returned an empty ELI5 explanation', 'GROQ_EMPTY_ELI5_RESPONSE');
  }

  return response;
};

export const generateMockQuestions = async (topic: string, count: number): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Generate ${count} MCQ questions for: ${topic}. Return as JSON array.`,
      },
    ],
    'quality',
    'mock_test_generation'
  );

  if (!response) {
    throw dependencyFailure('Groq returned empty mock questions', 'GROQ_EMPTY_MOCK_QUESTIONS');
  }

  return response;
};

export const reviewCode = async (code: string, language: string): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Review this ${language} code and suggest improvements: ${code}`,
      },
    ],
    'quality'
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
    'quality'
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
    'quality'
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
    'quality'
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
    'fast'
  );

  if (!response) {
    throw dependencyFailure('Groq returned an empty summary', 'GROQ_EMPTY_SUMMARY');
  }

  return response;
};

export const generateTopicTags = async (content: string): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: `Extract 5 relevant tags from this content as JSON array: ${content}`,
      },
    ],
    'fast'
  );

  if (!response) {
    throw dependencyFailure('Groq returned empty topic tags', 'GROQ_EMPTY_TOPIC_TAGS');
  }

  return response;
};

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  economyAIChatWithFallback: vi.fn(),
  economyAIStructuredWithFallback: vi.fn(),
}));

vi.mock('../../src/infrastructure/ai/ai-fallback.helper', () => ({
  economyAIChatWithFallback: mocks.economyAIChatWithFallback,
  economyAIStructuredWithFallback: mocks.economyAIStructuredWithFallback,
}));

import { generateMockTestQuestionsAI } from '../../src/infrastructure/ai/services/mock-test-ai.service';

const createResponse = (count: number) =>
  JSON.stringify({
    title: 'JavaScript fundamentals',
    description: 'Generated test',
    questions: Array.from({ length: count }, (_, index) => ({
      type: 'mcq',
      question: `Question ${index + 1}`,
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'A',
      explanation: 'Because A is correct',
      difficulty: 'medium',
      points: 2,
    })),
  });

describe('mock test AI generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.economyAIStructuredWithFallback.mockImplementation(
      async (messages, parseResponse) => {
        const prompt = messages[0].content as string;
        const count = Number(prompt.match(/Number of questions: (\d+)/)?.[1]);
        return parseResponse(createResponse(count));
      }
    );
  });

  it('batches a large regular mock test and merges every validated question', async () => {
    const result = await generateMockTestQuestionsAI({
      topic: 'JavaScript',
      difficulty: 'medium',
      questionCount: 18,
      questionTypes: ['mcq'],
    });

    expect(result.questions).toHaveLength(18);
    expect(mocks.economyAIStructuredWithFallback).toHaveBeenCalledTimes(3);
    expect(
      mocks.economyAIStructuredWithFallback.mock.calls.map((call) => call[4].operation)
    ).toEqual([
      'mock-test-generation-batch-1',
      'mock-test-generation-batch-2',
      'mock-test-generation-batch-3',
    ]);
  });

  it('uses smaller batches when coding templates make responses much larger', async () => {
    const result = await generateMockTestQuestionsAI({
      topic: 'Algorithms',
      difficulty: 'hard',
      questionCount: 5,
      questionTypes: ['mcq', 'coding'],
    });

    expect(result.questions).toHaveLength(5);
    expect(mocks.economyAIStructuredWithFallback).toHaveBeenCalledTimes(3);
    const prompts = mocks.economyAIStructuredWithFallback.mock.calls.map(
      (call) => call[0][0].content as string
    );
    expect(prompts).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Number of questions: 2'),
        expect.stringContaining('Number of questions: 1'),
      ])
    );
  });

  it('rejects AI output that contains an unselected question type', async () => {
    mocks.economyAIStructuredWithFallback.mockImplementationOnce(async (_messages, parseResponse) =>
      parseResponse(
        JSON.stringify({
          title: 'JavaScript fundamentals',
          description: 'Generated test',
          questions: [
            {
              type: 'coding',
              question: 'Write a function.',
              options: [],
              correctAnswer: '',
              explanation: 'Practice coding.',
              difficulty: 'medium',
              points: 2,
              coding: {
                functionName: 'answer',
                inputTypes: ['number'],
                outputType: 'number',
                starterCode: 'function answer(value) { return value; }',
                templates: {
                  javascript: '', typescript: '', python: '', java: '', cpp: '', c: '',
                },
                testCases: [{ input: [1], expectedOutput: 1 }],
              },
            },
          ],
        })
      )
    );

    await expect(
      generateMockTestQuestionsAI({
        topic: 'JavaScript',
        difficulty: 'medium',
        questionCount: 1,
        questionTypes: ['mcq'],
      })
    ).rejects.toThrow('AI returned a question type that was not selected');
  });
});

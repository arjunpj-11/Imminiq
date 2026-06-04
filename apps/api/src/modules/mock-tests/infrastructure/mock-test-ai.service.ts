import {
  MockTestAIServiceContract,
  GenerateQuestionsInput,
  EvaluateAnswerInput,
  EvaluateAnswerOutput,
  GenerateInsightsInput,
} from '../domain/services/mock-test-ai.service.interface'
import { groqChat } from '../../../infrastructure/ai/groq.client'
import { geminiChat } from '../../../infrastructure/ai/gemini.client'

type GenerateQuestionsOutput = Awaited<
  ReturnType<MockTestAIServiceContract['generateQuestions']>
>

const parseAIJson = <T>(value: string): T => {
  const clean = (value || '').replace(/```json/g, '').replace(/```/g, '').trim()
  const firstBrace = clean.indexOf('{')
  const lastBrace = clean.lastIndexOf('}')
  const json =
    firstBrace >= 0 && lastBrace >= firstBrace
      ? clean.slice(firstBrace, lastBrace + 1)
      : clean

  return JSON.parse(json) as T
}

export class MockTestAIService implements MockTestAIServiceContract {
  async generateQuestions(
    input: GenerateQuestionsInput
  ): Promise<GenerateQuestionsOutput> {
    const prompt = `You are an expert exam question writer.

Topic: ${input.topic}
Difficulty: ${input.difficulty}
Number of questions: ${input.questionCount}
Question types: ${input.questionTypes.join(', ')}

Return ONLY valid JSON:
{
  "title": "string",
  "description": "string",
  "questions": [{
    "type": "mcq|short_answer|coding",
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "string",
    "explanation": "string",
    "difficulty": "easy|medium|hard",
    "points": 1
  }]
}

Rules:
- MCQ must have exactly 4 options.
- correctAnswer for MCQ must be the exact option text.
- short_answer correctAnswer is a keyword or phrase.
- coding questions need a clear problem statement and expected approach.
- points: easy=1, medium=2, hard=3.`

    const response = await geminiChat(prompt)

    return parseAIJson<GenerateQuestionsOutput>(response)
  }

  async evaluateOpenAnswer(
    input: EvaluateAnswerInput
  ): Promise<EvaluateAnswerOutput> {
    const prompt = `Score this answer and return ONLY valid JSON.

Question: ${input.question}
${input.correctAnswer ? `Expected answer: ${input.correctAnswer}` : ''}
Student answer: ${input.userAnswer}
Max points: ${input.maxPoints}

Return {
  "score": number,
  "isCorrect": boolean,
  "feedback": "brief feedback"
}`

    const response =
      (await groqChat(
        [{ role: 'user', content: prompt }],
        'llama-3.3-70b-versatile'
      )) || ''

    return parseAIJson<EvaluateAnswerOutput>(response)
  }

  async generatePerformanceInsights(
    input: GenerateInsightsInput
  ): Promise<string> {
    const prompt = `Based on this student's mock test performance data, generate a brief 2-3 sentence personalized insight.

Performance trends: ${JSON.stringify(input.performanceTrends)}
Topic breakdown: ${JSON.stringify(input.topicBreakdown)}

Return only the insight text.`

    return (
      (await groqChat(
        [{ role: 'user', content: prompt }],
        'llama-3.1-8b-instant'
      )) || 'Keep practicing to improve your performance across all topics.'
    )
  }
}
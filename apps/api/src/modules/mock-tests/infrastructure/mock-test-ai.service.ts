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
    input: GenerateQuestionsInput,
  ): Promise<GenerateQuestionsOutput> {
    const prompt = `You are an expert exam question writer and coding interview problem creator.

Topic: ${input.topic}
Difficulty: ${input.difficulty}
Number of questions: ${input.questionCount}
Question types: ${input.questionTypes.join(', ')}

Return ONLY valid JSON:
{
  "title": "string",
  "description": "string",
  "questions": [
    {
      "type": "mcq|short_answer|coding",
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "string",
      "explanation": "string",
      "difficulty": "easy|medium|hard",
      "points": 1,
      "coding": {
        "functionName": "twoSum",
        "language": "javascript",
        "inputTypes": ["number[]", "number"],
        "outputType": "number[]",
        "starterCode": "function twoSum(nums, target) {\\n  // write your code here\\n}",
        "templates": {
          "javascript": "function twoSum(nums, target) {\\n  // write your code here\\n}",
          "typescript": "function twoSum(nums: number[], target: number): number[] {\\n  // write your code here\\n}",
          "python": "def twoSum(nums, target):\\n    # write your code here\\n    pass",
          "java": "class Solution {\\n  public static int[] twoSum(int[] nums, int target) {\\n    // write your code here\\n    return new int[]{};\\n  }\\n}",
          "cpp": "vector<int> twoSum(vector<int> nums, int target) {\\n  // write your code here\\n  return {};\\n}",
          "c": "int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\\n  // write your code here\\n  *returnSize = 0;\\n  return NULL;\\n}"
        },
        "testCases": [
          {
            "input": [[2, 7, 11, 15], 9],
            "expectedOutput": [0, 1],
            "isHidden": false,
            "explanation": "nums[0] + nums[1] = 9"
          },
          {
            "input": [[3, 2, 4], 6],
            "expectedOutput": [1, 2],
            "isHidden": true
          }
        ]
      }
    }
  ]
}

Allowed coding languages:
- javascript
- typescript
- python
- java
- cpp
- c

Allowed coding inputTypes and outputType:
- number
- string
- boolean
- number[]
- string[]
- boolean[]
- number[][]
- string[][]

Rules:
- Return exactly ${input.questionCount} questions.
- MCQ must have exactly 4 options.
- correctAnswer for MCQ must be the exact option text.
- short_answer correctAnswer is a keyword or phrase.
- For coding questions, include coding object.
- For coding questions, always include functionName, language, inputTypes, outputType, starterCode, templates, and testCases.
- The default coding language field can be javascript.
- Coding questions must include templates for javascript, typescript, python, java, cpp, and c.
- The same functionName must be used in every language template.
- Coding starterCode must define the exact functionName.
- Coding testCases input must always be an array of function arguments.
- Coding questions must include at least 2 visible test cases and 3 hidden test cases.
- Do not include console.log in starterCode or templates.
- Java template must use class Solution, not public class Main.
- Java method must be public static.
- C++ template must not include main().
- C++ template must not include #include because backend runner adds it.
- C++ template can use vector, string, and bool directly.
- C template must not include main().
- C template can include malloc usage when returning arrays.
- For C array inputs, add size parameter immediately after the array parameter.
- For C array output, use returnSize pointer.
- Avoid string and string[] output for C questions.
- Prefer number, boolean, number[], and number[][] coding problems for best multi-language compatibility.
- points: easy=1, medium=2, hard=3.
- For non-coding questions, do not include the coding field.`

    const response = await geminiChat(prompt)

    return parseAIJson<GenerateQuestionsOutput>(response)
  }

  async evaluateOpenAnswer(
    input: EvaluateAnswerInput,
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
        'llama-3.3-70b-versatile',
      )) || ''

    return parseAIJson<EvaluateAnswerOutput>(response)
  }

  async generatePerformanceInsights(
    input: GenerateInsightsInput,
  ): Promise<string> {
    const prompt = `Based on this student's mock test performance data, generate a brief 2-3 sentence personalized insight.

Performance trends: ${JSON.stringify(input.performanceTrends)}
Topic breakdown: ${JSON.stringify(input.topicBreakdown)}

Return only the insight text.`

    return (
      (await groqChat(
        [{ role: 'user', content: prompt }],
        'llama-3.1-8b-instant',
      )) || 'Keep practicing to improve your performance across all topics.'
    )
  }
}
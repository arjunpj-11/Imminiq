export const buildMockTestQuestionsPrompt = (input: {
  topic: string;
  difficulty: string;
  questionCount: number;
  questionTypes: string[];
}): string => `You are an expert exam question writer and coding interview problem creator.

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
- For coding questions, set correctAnswer to an empty string "".
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
- For non-coding questions, do not include the coding field.`;

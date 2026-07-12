import { executeCodeWithPiston } from '../../../../infrastructure/compiler/piston.service'
import { MockTestsDomainError } from '../../domain/errors/mock-tests-domain.error'
import type { MockTestCodingLanguage, MockTestCodingValueType } from '../../domain/value-objects/coding-language.vo'
import type { MockTestCodingDetails, MockTestCodingTestCase } from '../../domain/value-objects/mock-test-coding.vo'
import type {
  MockTestCodeRunMode,
  MockTestCodeRunResult,
  IMockTestCodeRunner,
  MockTestCodeTestCaseResult,
} from '../../domain/services/mock-test-code-runner.interface'

type CodeRunMode = MockTestCodeRunMode
type TestCaseResult = MockTestCodeTestCaseResult

const RESULT_MARKER = '__IMMINIQ_MOCK_TEST_RESULT__'

const languageIdByLanguage: Record<MockTestCodingLanguage, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
}

const getLanguageId = (
  language: MockTestCodingLanguage,
  languageId?: number,
) => languageId || languageIdByLanguage[language]

const escapeForSingleQuotedString = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")

const escapeForPythonTripleQuotedString = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"')

const jsonStringLiteral = (value: unknown): string => {
  return JSON.stringify(String(value))
}

const toCppLiteral = (value: unknown, type: MockTestCodingValueType): string => {
  if (type === 'number') return String(Number(value))
  if (type === 'boolean') return value ? 'true' : 'false'
  if (type === 'string') return jsonStringLiteral(value)

  if (type === 'number[]') {
    return `{${Array.isArray(value) ? value.map((item) => Number(item)).join(', ') : ''}}`
  }

  if (type === 'boolean[]') {
    return `{${Array.isArray(value) ? value.map((item) => (item ? 'true' : 'false')).join(', ') : ''}}`
  }

  if (type === 'string[]') {
    return `{${Array.isArray(value) ? value.map(jsonStringLiteral).join(', ') : ''}}`
  }

  if (type === 'number[][]') {
    return `{${Array.isArray(value) ? value.map((row) => toCppLiteral(row, 'number[]')).join(', ') : ''}}`
  }

  if (type === 'string[][]') {
    return `{${Array.isArray(value) ? value.map((row) => toCppLiteral(row, 'string[]')).join(', ') : ''}}`
  }

  return '{}'
}

const toJavaLiteral = (value: unknown, type: MockTestCodingValueType): string => {
  if (type === 'number') return String(Number(value))
  if (type === 'boolean') return value ? 'true' : 'false'
  if (type === 'string') return jsonStringLiteral(value)

  if (type === 'number[]') {
    return `new int[]{${Array.isArray(value) ? value.map((item) => Number(item)).join(', ') : ''}}`
  }

  if (type === 'boolean[]') {
    return `new boolean[]{${Array.isArray(value) ? value.map((item) => (item ? 'true' : 'false')).join(', ') : ''}}`
  }

  if (type === 'string[]') {
    return `new String[]{${Array.isArray(value) ? value.map(jsonStringLiteral).join(', ') : ''}}`
  }

  if (type === 'number[][]') {
    return `new int[][]{${Array.isArray(value) ? value.map((row) => toJavaLiteral(row, 'number[]').replace('new int[]', '')).join(', ') : ''}}`
  }

  if (type === 'string[][]') {
    return `new String[][]{${Array.isArray(value) ? value.map((row) => toJavaLiteral(row, 'string[]').replace('new String[]', '')).join(', ') : ''}}`
  }

  return 'null'
}

const toCppType = (type: MockTestCodingValueType): string => {
  switch (type) {
    case 'number':
      return 'int'
    case 'string':
      return 'string'
    case 'boolean':
      return 'bool'
    case 'number[]':
      return 'vector<int>'
    case 'string[]':
      return 'vector<string>'
    case 'boolean[]':
      return 'vector<bool>'
    case 'number[][]':
      return 'vector<vector<int>>'
    case 'string[][]':
      return 'vector<vector<string>>'
    default:
      return 'int'
  }
}

const toJavaType = (type: MockTestCodingValueType): string => {
  switch (type) {
    case 'number':
      return 'int'
    case 'string':
      return 'String'
    case 'boolean':
      return 'boolean'
    case 'number[]':
      return 'int[]'
    case 'string[]':
      return 'String[]'
    case 'boolean[]':
      return 'boolean[]'
    case 'number[][]':
      return 'int[][]'
    case 'string[][]':
      return 'String[][]'
    default:
      return 'int'
  }
}

const buildJavaScriptRunner = (
  sourceCode: string,
  coding: MockTestCodingDetails,
  testCases: MockTestCodingTestCase[],
): string => {
  const testCaseJson = JSON.stringify(testCases)

  return `
${sourceCode}

const __imminiqDeepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)

const __imminiqNormalizeError = (error) => {
  if (!error) return 'Unknown error'
  return error && error.message ? error.message : String(error)
}

const __imminiqTestCases = ${testCaseJson}
const __imminiqResults = []

let __imminiqTarget

try {
  __imminiqTarget = eval('${escapeForSingleQuotedString(coding.functionName)}')
} catch (error) {
  __imminiqTarget = undefined
}

for (let i = 0; i < __imminiqTestCases.length; i += 1) {
  const testCase = __imminiqTestCases[i]

  try {
    if (typeof __imminiqTarget !== 'function') {
      throw new TypeError('Function ${escapeForSingleQuotedString(coding.functionName)} was not found')
    }

    const actualOutput = __imminiqTarget(...testCase.input)
    const passed = __imminiqDeepEqual(actualOutput, testCase.expectedOutput)

    __imminiqResults.push({
      index: i,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput,
      passed,
      isHidden: Boolean(testCase.isHidden),
      explanation: testCase.explanation
    })
  } catch (error) {
    __imminiqResults.push({
      index: i,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: null,
      passed: false,
      isHidden: Boolean(testCase.isHidden),
      explanation: testCase.explanation,
      error: __imminiqNormalizeError(error)
    })
  }
}

console.log('${RESULT_MARKER}' + JSON.stringify(__imminiqResults))
`
}

const buildPythonRunner = (
  sourceCode: string,
  coding: MockTestCodingDetails,
  testCases: MockTestCodingTestCase[],
): string => {
  const testCaseJson = JSON.stringify(testCases)

  return `
${sourceCode}

import json

__imminiq_test_cases = json.loads("""${escapeForPythonTripleQuotedString(testCaseJson)}""")
__imminiq_results = []

try:
    __imminiq_target = globals().get("${coding.functionName}")
except Exception:
    __imminiq_target = None

for i, test_case in enumerate(__imminiq_test_cases):
    try:
        if not callable(__imminiq_target):
            raise Exception("Function ${coding.functionName} was not found")

        actual_output = __imminiq_target(*test_case.get("input", []))
        expected_output = test_case.get("expectedOutput")
        passed = actual_output == expected_output

        __imminiq_results.append({
            "index": i,
            "input": test_case.get("input", []),
            "expectedOutput": expected_output,
            "actualOutput": actual_output,
            "passed": passed,
            "isHidden": bool(test_case.get("isHidden")),
            "explanation": test_case.get("explanation")
        })
    except Exception as error:
        __imminiq_results.append({
            "index": i,
            "input": test_case.get("input", []),
            "expectedOutput": test_case.get("expectedOutput"),
            "actualOutput": None,
            "passed": False,
            "isHidden": bool(test_case.get("isHidden")),
            "explanation": test_case.get("explanation"),
            "error": str(error)
        })

print("${RESULT_MARKER}" + json.dumps(__imminiq_results))
`
}

const buildCppRunner = (
  sourceCode: string,
  coding: MockTestCodingDetails,
  testCases: MockTestCodingTestCase[],
): string => {
  const cases = testCases
    .map((testCase, index) => {
      const args = coding.inputTypes.map((type, argIndex) => {
        return `${toCppType(type)} arg${argIndex} = ${toCppLiteral(testCase.input[argIndex], type)};`
      })

      const callArgs = coding.inputTypes.map((_, argIndex) => `arg${argIndex}`).join(', ')
      const expected = `${toCppType(coding.outputType)} expected = ${toCppLiteral(testCase.expectedOutput, coding.outputType)};`

      return `
try {
  ${args.join('\n  ')}
  ${expected}
  auto actual = ${coding.functionName}(${callArgs});
  bool passed = stringify(actual) == stringify(expected);
  cout << "{\\"index\\":${index},\\"input\\":\\"[case]\\",\\"expectedOutput\\":" << quoteJson(stringify(expected)) << ",\\"actualOutput\\":" << quoteJson(stringify(actual)) << ",\\"passed\\":" << (passed ? "true" : "false") << ",\\"isHidden\\":${testCase.isHidden ? 'true' : 'false'} << "}";
} catch (...) {
  cout << "{\\"index\\":${index},\\"input\\":\\"[case]\\",\\"expectedOutput\\":\\"[error]\\",\\"actualOutput\\":null,\\"passed\\":false,\\"isHidden\\":${testCase.isHidden ? 'true' : 'false'},\\"error\\":\\"Runtime error\\"}";
}
`
    })
    .join('cout << ",";\n')

  return `
#include <bits/stdc++.h>
using namespace std;

${sourceCode}

string escapeJson(const string& s) {
  string out;
  for (char c : s) {
    if (c == '"') out += "\\\\\\"";
    else if (c == '\\\\') out += "\\\\\\\\";
    else if (c == '\\n') out += "\\\\n";
    else out += c;
  }
  return out;
}

string quoteJson(const string& s) {
  return string("\\"") + escapeJson(s) + string("\\"");
}

string stringify(const string& value) { return value; }
string stringify(const char* value) { return string(value); }
string stringify(int value) { return to_string(value); }
string stringify(bool value) { return value ? "true" : "false"; }

template <typename T>
string stringify(const vector<T>& values) {
  string result = "[";
  for (size_t i = 0; i < values.size(); i++) {
    if (i) result += ",";
    result += stringify(values[i]);
  }
  result += "]";
  return result;
}

int main() {
  cout << "${RESULT_MARKER}";
  cout << "[";
  ${cases}
  cout << "]";
  return 0;
}
`
}

const buildJavaRunner = (
  sourceCode: string,
  coding: MockTestCodingDetails,
  testCases: MockTestCodingTestCase[],
): string => {
  const cases = testCases
    .map((testCase, index) => {
      const args = coding.inputTypes.map((type, argIndex) => {
        return `${toJavaType(type)} arg${argIndex} = ${toJavaLiteral(testCase.input[argIndex], type)};`
      })

      const callArgs = coding.inputTypes.map((_, argIndex) => `arg${argIndex}`).join(', ')
      const expected = `${toJavaType(coding.outputType)} expected = ${toJavaLiteral(testCase.expectedOutput, coding.outputType)};`

      return `
try {
  ${args.join('\n  ')}
  ${expected}
  ${toJavaType(coding.outputType)} actual = Solution.${coding.functionName}(${callArgs});
  boolean passed = stringify(actual).equals(stringify(expected));
  System.out.print("{\\"index\\":${index},\\"input\\":\\"[case]\\",\\"expectedOutput\\":" + quoteJson(stringify(expected)) + ",\\"actualOutput\\":" + quoteJson(stringify(actual)) + ",\\"passed\\":" + passed + ",\\"isHidden\\":${testCase.isHidden ? 'true' : 'false'} + "}");
} catch (Exception error) {
  System.out.print("{\\"index\\":${index},\\"input\\":\\"[case]\\",\\"expectedOutput\\":\\"[error]\\",\\"actualOutput\\":null,\\"passed\\":false,\\"isHidden\\":${testCase.isHidden ? 'true' : 'false'},\\"error\\":" + quoteJson(error.getMessage()) + "}");
}
`
    })
    .join('System.out.print(",");\n')

  return `
import java.util.*;

${sourceCode}

public class Main {
  static String escapeJson(String value) {
    if (value == null) return "";
    return value.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"").replace("\\n", "\\\\n");
  }

  static String quoteJson(String value) {
    return "\\"" + escapeJson(value) + "\\"";
  }

  static String stringify(int value) { return String.valueOf(value); }
  static String stringify(boolean value) { return String.valueOf(value); }
  static String stringify(String value) { return value; }
  static String stringify(int[] value) { return Arrays.toString(value).replace(" ", ""); }
  static String stringify(boolean[] value) { return Arrays.toString(value).replace(" ", ""); }
  static String stringify(String[] value) { return Arrays.toString(value).replace(" ", ""); }
  static String stringify(int[][] value) { return Arrays.deepToString(value).replace(" ", ""); }
  static String stringify(String[][] value) { return Arrays.deepToString(value).replace(" ", ""); }

  public static void main(String[] args) {
    System.out.print("${RESULT_MARKER}");
    System.out.print("[");
    ${cases}
    System.out.print("]");
  }
}
`
}

const buildCRunner = (
  sourceCode: string,
  coding: MockTestCodingDetails,
  testCases: MockTestCodingTestCase[],
): string => {
  if (
    coding.inputTypes.some((type) => !['number', 'boolean', 'number[]'].includes(type)) ||
    !['number', 'boolean', 'number[]'].includes(coding.outputType)
  ) {
    throw new MockTestsDomainError(
      'C_TYPE_NOT_SUPPORTED',
      'C mock test runner currently supports number, boolean, and number[] only',
    )
  }

  const numberArrayLiteral = (value: unknown) =>
    `{${Array.isArray(value) ? value.map((item) => Number(item)).join(', ') : ''}}`

  const cases = testCases
    .map((testCase, index) => {
      const declarations: string[] = []
      const callArgs: string[] = []

      coding.inputTypes.forEach((type, argIndex) => {
        const value = testCase.input[argIndex]

        if (type === 'number[]') {
          const arr = Array.isArray(value) ? value : []
          declarations.push(`int arg${argIndex}[] = ${numberArrayLiteral(arr)};`)
          declarations.push(`int arg${argIndex}Size = ${arr.length};`)
          callArgs.push(`arg${argIndex}`)
          callArgs.push(`arg${argIndex}Size`)
          return
        }

        if (type === 'boolean') {
          declarations.push(`bool arg${argIndex} = ${value ? 'true' : 'false'};`)
          callArgs.push(`arg${argIndex}`)
          return
        }

        declarations.push(`int arg${argIndex} = ${Number(value)};`)
        callArgs.push(`arg${argIndex}`)
      })

      if (coding.outputType === 'number[]') {
        const expected = Array.isArray(testCase.expectedOutput)
          ? testCase.expectedOutput
          : []

        return `
{
  ${declarations.join('\n  ')}
  int expected[] = ${numberArrayLiteral(expected)};
  int expectedSize = ${expected.length};
  int returnSize = 0;
  int* actual = ${coding.functionName}(${callArgs.join(', ')}, &returnSize);
  bool passed = compareIntArray(actual, returnSize, expected, expectedSize);
  printf("{\\"index\\":${index},\\"input\\":\\"[case]\\",\\"expectedOutput\\":\\"[array]\\",\\"actualOutput\\":\\"[array]\\",\\"passed\\":%s,\\"isHidden\\":${testCase.isHidden ? 'true' : 'false'}}", passed ? "true" : "false");
}
`
      }

      const expected =
        coding.outputType === 'boolean'
          ? testCase.expectedOutput
            ? 'true'
            : 'false'
          : String(Number(testCase.expectedOutput))

      return `
{
  ${declarations.join('\n  ')}
  ${coding.outputType === 'boolean' ? 'bool' : 'int'} expected = ${expected};
  ${coding.outputType === 'boolean' ? 'bool' : 'int'} actual = ${coding.functionName}(${callArgs.join(', ')});
  bool passed = actual == expected;
  printf("{\\"index\\":${index},\\"input\\":\\"[case]\\",\\"expectedOutput\\":\\"%d\\",\\"actualOutput\\":\\"%d\\",\\"passed\\":%s,\\"isHidden\\":${testCase.isHidden ? 'true' : 'false'}}", expected, actual, passed ? "true" : "false");
}
`
    })
    .join('printf(",");\n')

  return `
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

${sourceCode}

bool compareIntArray(int* a, int aSize, int* b, int bSize) {
  if (aSize != bSize) return false;
  for (int i = 0; i < aSize; i++) {
    if (a[i] != b[i]) return false;
  }
  return true;
}

int main() {
  printf("${RESULT_MARKER}");
  printf("[");
  ${cases}
  printf("]");
  return 0;
}
`
}

const buildRunner = ({
  sourceCode,
  coding,
  testCases,
  language,
}: {
  sourceCode: string
  coding: MockTestCodingDetails
  testCases: MockTestCodingTestCase[]
  language: MockTestCodingLanguage
}) => {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return buildJavaScriptRunner(sourceCode, coding, testCases)
    case 'python':
      return buildPythonRunner(sourceCode, coding, testCases)
    case 'java':
      return buildJavaRunner(sourceCode, coding, testCases)
    case 'cpp':
      return buildCppRunner(sourceCode, coding, testCases)
    case 'c':
      return buildCRunner(sourceCode, coding, testCases)
    default:
      throw new MockTestsDomainError(
        'UNSUPPORTED_CODING_LANGUAGE',
        'Unsupported coding language',
      )
  }
}

const parseRunnerResults = (stdout: string): TestCaseResult[] => {
  const markerIndex = stdout.lastIndexOf(RESULT_MARKER)

  if (markerIndex < 0) return []

  const jsonText = stdout.slice(markerIndex + RESULT_MARKER.length).trim()

  try {
    const parsed = JSON.parse(jsonText) as TestCaseResult[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const hideHiddenTestCaseDetails = (testCase: TestCaseResult): TestCaseResult => {
  if (!testCase.isHidden) return testCase

  return {
    ...testCase,
    input: [],
    expectedOutput: '[hidden]',
    actualOutput: testCase.passed ? '[hidden]' : testCase.actualOutput,
  }
}

const runMockTestCodingQuestion = async ({
  sourceCode,
  coding,
  mode,
  language,
  languageId,
}: {
  sourceCode: string
  coding: MockTestCodingDetails
  mode: CodeRunMode
  language?: MockTestCodingLanguage
  languageId?: number
}): Promise<MockTestCodeRunResult> => {
  const selectedLanguage = language || coding.language || 'javascript'

  const selectedTestCases =
    mode === 'run'
      ? coding.testCases.filter((testCase) => !testCase.isHidden)
      : coding.testCases

  const testCasesToRun = selectedTestCases.length
    ? selectedTestCases
    : coding.testCases

  const runnerCode = buildRunner({
    sourceCode,
    coding,
    testCases: testCasesToRun,
    language: selectedLanguage,
  })

  const execution = await executeCodeWithPiston({
    sourceCode: runnerCode,
    language: selectedLanguage,
    languageId: getLanguageId(selectedLanguage, languageId),
  })

  const parsedResults = parseRunnerResults(execution.stdout)

  const hasExecutionFailure =
    Boolean(execution.stderr) ||
    Boolean(execution.compileOutput) ||
    execution.status.id !== 3

  const testCases =
    parsedResults.length > 0
      ? parsedResults
      : testCasesToRun.map((testCase, index) => ({
        index,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: null,
        passed: false,
        isHidden: Boolean(testCase.isHidden),
        explanation: testCase.explanation,
        error:
          execution.stderr ||
          execution.compileOutput ||
          execution.message ||
          'Code execution failed',
      }))

  const passedCount = testCases.filter((testCase) => testCase.passed).length
  const totalCount = testCases.length

  return {
    passed: !hasExecutionFailure && totalCount > 0 && passedCount === totalCount,
    passedCount,
    totalCount,
    testCases:
      mode === 'run'
        ? testCases
        : testCases.map(hideHiddenTestCaseDetails),
    stdout: execution.stdout
      .replace(new RegExp(`${RESULT_MARKER}.*`, 's'), '')
      .trim(),
    stderr: execution.stderr,
    compileOutput: execution.compileOutput,
    message: execution.message,
    status: execution.status,
  }
}


export class PistonMockTestCodeRunner
  implements IMockTestCodeRunner {
  async run(
    input: Parameters<IMockTestCodeRunner['run']>[0],
  ): Promise<MockTestCodeRunResult> {
    try {
      return await runMockTestCodingQuestion(input)
    } catch (error) {
      if (error instanceof MockTestsDomainError) {
        throw error
      }

      throw new MockTestsDomainError(
        'CODE_EXECUTION_FAILED',
        'Mock test code execution failed',
      )
    }
  }
}

export const pistonMockTestCodeRunner =
  new PistonMockTestCodeRunner()

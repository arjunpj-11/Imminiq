import type { MockTestCodingLanguage, MockTestCodingValueType } from './coding-language.vo'

export type MockTestCodingTestCase = {
  input: unknown[]
  expectedOutput: unknown
  isHidden: boolean
  explanation?: string
}

export type MockTestCodingDetails = {
  functionName: string
  language: MockTestCodingLanguage
  inputTypes: MockTestCodingValueType[]
  outputType: MockTestCodingValueType
  starterCode: string
  templates?: Partial<Record<MockTestCodingLanguage, string>>
  testCases: MockTestCodingTestCase[]
}

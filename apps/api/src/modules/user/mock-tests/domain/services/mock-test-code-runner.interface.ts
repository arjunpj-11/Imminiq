import type { MockTestCodingLanguage } from '../value-objects/coding-language.vo';
import type { MockTestCodingDetails } from '../value-objects/mock-test-coding.vo';

export type MockTestCodeRunMode = 'run' | 'submit';

export type MockTestCodeTestCaseResult = {
  index: number;
  input: unknown[];
  expectedOutput: unknown;
  actualOutput: unknown;
  passed: boolean;
  isHidden: boolean;
  error?: string;
  explanation?: string;
};

export type MockTestCodeRunResult = {
  passed: boolean;
  passedCount: number;
  totalCount: number;
  testCases: MockTestCodeTestCaseResult[];
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
  status: {
    id: number;
    description: string;
  };
};

export interface IMockTestCodeRunner {
  run(input: {
    sourceCode: string;
    coding: MockTestCodingDetails;
    mode: MockTestCodeRunMode;
    language?: MockTestCodingLanguage;
    languageId?: number;
  }): Promise<MockTestCodeRunResult>;
}

export type CodeExecutionResult = {
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
  status: {
    id: number;
    description: string;
  };
  time?: string | null;
  memory?: number | null;
};

export type CodeSubmissionResult = CodeExecutionResult & {
  isCorrect: boolean;
  expectedOutput: string;
  actualOutput: string;
  feedback: string;
  canCompareOptimized: boolean;
  canAskHints: boolean;
};

export interface ICodeExecutor {
  executeCode(input: {
    sourceCode: string;
    languageId?: number;
    language: string;
    stdin?: string;
  }): Promise<CodeExecutionResult>;
}

export interface ICodeExecutor {
  executeCode(input: {
    sourceCode: string
    languageId?: number
    language: string
    stdin?: string
  }): Promise<{
    stdout: string
    stderr: string
    compileOutput: string
    message: string
    status: {
      id: number
      description: string
    }
    time?: string | null
    memory?: number | null
  }>
}

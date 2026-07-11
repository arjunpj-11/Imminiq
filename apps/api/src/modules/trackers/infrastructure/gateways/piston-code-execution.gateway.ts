import { executeCodeWithPiston } from '../../../../infrastructure/compiler/piston.service'
import { TrackerDomainError } from '../../domain/errors/tracker-domain.error'
import type { CodeExecutorContract } from '../../domain/services/code-execution.interface'

export class PistonCodeExecutionGateway implements CodeExecutorContract {
  async executeCode(
    input: Parameters<CodeExecutorContract['executeCode']>[0],
  ) {
    try {
      return await executeCodeWithPiston(input)
    } catch {
      throw new TrackerDomainError(
        'CODE_EXECUTION_FAILED',
        'Code execution gateway failed',
      )
    }
  }
}

export const pistonCodeExecutionGateway = new PistonCodeExecutionGateway()

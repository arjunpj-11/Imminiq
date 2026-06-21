import { executeCodeWithPiston } from '../../../../infrastructure/compiler/piston.service'
import { TrackerDomainError } from '../../domain/errors/tracker-domain.error'
import type { CodeExecutionServiceContract } from '../../domain/services/code-execution.service.interface'

export class PistonCodeExecutionGateway implements CodeExecutionServiceContract {
  async executeCode(
    input: Parameters<CodeExecutionServiceContract['executeCode']>[0],
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

import { executeCodeWithPiston } from '../../../../infrastructure/compiler/piston.service'
import { TrackerDomainError } from '../../domain/tracker-domain.error'
import type { ICodeExecutor } from '../../domain/services/code-execution.interface'

export class PistonCodeExecutionGateway implements ICodeExecutor {
  async executeCode(
    input: Parameters<ICodeExecutor['executeCode']>[0],
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

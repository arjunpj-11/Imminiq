import { executeCodeWithPiston } from '../../../../infrastructure/compiler/piston.service'
import type { CodeExecutionServiceContract } from '../../domain/services/code-execution.service.interface'

export const pistonCodeExecutionService: CodeExecutionServiceContract = {
  executeCode: executeCodeWithPiston,
}

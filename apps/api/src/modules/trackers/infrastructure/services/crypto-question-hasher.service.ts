import { createHash } from 'crypto'

import type { QuestionHasherServiceContract } from '../../domain/services/question-hasher.service.interface'

export class CryptoQuestionHasherService implements QuestionHasherServiceContract {
  hash(question: string): string {
    return createHash('sha256')
      .update(question.trim().toLowerCase())
      .digest('hex')
  }
}

export const cryptoQuestionHasherService = new CryptoQuestionHasherService()

import { createHash } from 'crypto'

import type { QuestionHasherContract } from '../../domain/services/question-hasher.interface'

export class CryptoQuestionHasher implements QuestionHasherContract {
  hash(question: string): string {
    return createHash('sha256')
      .update(question.trim().toLowerCase())
      .digest('hex')
  }
}

export const cryptoQuestionHasher = new CryptoQuestionHasher()

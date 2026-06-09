// infrastructure/database/services/question-bank.service.ts
import { QuestionBankCounterModel } from '../../../infrastructure/database/models/question-bank-counter.model'
import { QuestionBankModel } from '../../../infrastructure/database/models/question-bank.model'
import type {
  DifficultyLevel,
  QuestionType,
  MockTestCodingDetails,
} from '../domain/types/mock-tests.types'

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export type QuestionBankItem = {
  bankId?: number
  topic?: string
  type: QuestionType
  question: string
  options?: string[]
  correctAnswer?: string
  explanation?: string
  difficulty: DifficultyLevel
  points: number
  coding?: MockTestCodingDetails
}
/**
 * Atomically increments the global question bank counter and returns the next value.
 */
const nextBankId = async (): Promise<number> => {
  const doc = await QuestionBankCounterModel.findByIdAndUpdate(
    'questionBank',
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  )
  return doc.seq
}

/**
 * Saves a batch of questions to the question bank, assigning sequential bankIds.
 */
export const saveToQuestionBank = async (
  topic: string,
  questions: Omit<QuestionBankItem, 'bankId' | 'topic'>[],
): Promise<QuestionBankItem[]> => {
  const docs = await Promise.all(
    questions.map(async (q) => {
      const bankId = await nextBankId()
      return QuestionBankModel.create({ ...q, topic, bankId })
    }),
  )
  return docs.map((d) => d.toObject() as QuestionBankItem)
}

/**
 * Randomly samples `count` questions from the bank matching topic and optional difficulty.
 * Uses MongoDB $sample for true random selection.
 */
export const sampleFromQuestionBank = async (
  topic: string,
  count: number,
  difficulty?: DifficultyLevel,
): Promise<QuestionBankItem[]> => {
  const normalizedTopic = topic.trim()
  const safeTopic = escapeRegExp(normalizedTopic)
  const match: Record<string, unknown> = {
    topic: { $regex: new RegExp(`^${safeTopic}$`, 'i') }, // case-insensitive exact match
  }
  if (difficulty) match.difficulty = difficulty

  return QuestionBankModel.aggregate<QuestionBankItem>([
    { $match: match },
    { $sample: { size: count } },
  ])
}
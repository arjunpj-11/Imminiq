import { QuestionBankCounterModel } from '../../../../../infrastructure/database/models/question-bank-counter.model';
import { QuestionBankModel } from '../../../../../infrastructure/database/models/question-bank.model';
import { MockTestsDomainError } from '../../domain/mock-tests-domain.error';
import type {
  IMockTestQuestionBank,
  QuestionBankItem,
} from '../../domain/services/mock-test-question-bank.interface';
import type { DifficultyLevel } from '../../domain/value-objects/difficulty-level.vo';

const USE_AI_GENERATION = true;

export class MongoQuestionBank implements IMockTestQuestionBank {
  shouldUseAI(): boolean {
    return USE_AI_GENERATION;
  }

  async saveToQuestionBank(
    topic: string,
    questions: Omit<QuestionBankItem, 'bankId' | 'topic'>[]
  ): Promise<QuestionBankItem[]> {
    try {
      const docs = await Promise.all(
        questions.map(async (question) => {
          const bankId = await this.nextBankId();
          return QuestionBankModel.create({ ...question, topic, bankId });
        })
      );

      return docs.map((doc) => doc.toObject() as QuestionBankItem);
    } catch {
      throw new MockTestsDomainError(
        'QUESTION_BANK_SAVE_FAILED',
        'Failed to save generated mock test questions'
      );
    }
  }

  async sampleFromQuestionBank(
    topic: string,
    count: number,
    difficulty?: DifficultyLevel
  ): Promise<QuestionBankItem[]> {
    try {
      const normalizedTopic = topic.trim();
      const safeTopic = this.escapeRegExp(normalizedTopic);
      const match: Record<string, unknown> = {
        topic: { $regex: new RegExp(`^${safeTopic}$`, 'i') },
      };

      if (difficulty) {
        match.difficulty = difficulty;
      }

      return QuestionBankModel.aggregate<QuestionBankItem>([
        { $match: match },
        { $sample: { size: count } },
      ]);
    } catch {
      throw new MockTestsDomainError(
        'QUESTION_BANK_READ_FAILED',
        'Failed to read mock test questions'
      );
    }
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private async nextBankId(): Promise<number> {
    const doc = await QuestionBankCounterModel.findByIdAndUpdate(
      'questionBank',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (!doc) {
      throw new MockTestsDomainError(
        'QUESTION_BANK_COUNTER_FAILED',
        'Failed to allocate a question bank identifier'
      );
    }

    return doc.seq;
  }
}

export const mongoQuestionBank = new MongoQuestionBank();

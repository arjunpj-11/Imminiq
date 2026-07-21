import { QuestionBankCounterModel } from '../../../../../infrastructure/database/models/question-bank-counter.model';
import { QuestionBankModel } from '../../../../../infrastructure/database/models/question-bank.model';
import { MockTestsDomainError } from '../../domain/mock-tests-domain.error';
import type {
  IMockTestQuestionBank,
  QuestionBankItem,
} from '../../domain/services/mock-test-question-bank.interface';
import type { DifficultyLevel } from '../../domain/value-objects/difficulty-level.vo';
import type { QuestionType } from '../../domain/value-objects/question-type.vo';

import { env } from '../../../../../config/env';

export class MongoQuestionBank implements IMockTestQuestionBank {
  shouldUseAI(): boolean {
    return env.MOCK_TEST_AI_GENERATION_ENABLED;
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
    difficulty?: DifficultyLevel,
    questionTypes?: QuestionType[]
  ): Promise<QuestionBankItem[]> {
    try {
      const normalizedTopic = topic.trim();
      const safeTopic = this.escapeRegExp(normalizedTopic);
      const match: Record<string, unknown> = {
        topic: { $regex: new RegExp(`^${safeTopic}$`, 'i') },
        deletedAt: null,
      };

      if (difficulty) {
        match.difficulty = difficulty;
      }

      if (questionTypes?.length) {
        match.type = { $in: questionTypes };
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
      { returnDocument: 'after', upsert: true }
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

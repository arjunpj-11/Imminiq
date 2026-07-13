import type { DifficultyLevel } from '../../../domain/value-objects/difficulty-level.vo';

const ALLOWED_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const SAFE_TAG_PATTERN = /^[a-zA-Z0-9 _-]{1,40}$/;

export class MongoMockTestsQueryUtils {
  private constructor() {}

  static sanitizeDifficulty(
    value?: DifficultyLevel,
  ): DifficultyLevel | undefined {
    return value && ALLOWED_DIFFICULTIES.includes(value) ? value : undefined;
  }

  static sanitizeTags(tags?: string[]): string[] {
    if (!Array.isArray(tags)) {
      return [];
    }

    return tags
      .filter((tag): tag is string => typeof tag === 'string')
      .map((tag) => tag.trim())
      .filter((tag) => SAFE_TAG_PATTERN.test(tag))
      .slice(0, 20);
  }

  static sanitizePage(page: number): number {
    return Number.isInteger(page) && page > 0 ? page : 1;
  }

  static sanitizeLimit(limit: number): number {
    return Number.isInteger(limit) && limit > 0 && limit <= 50 ? limit : 20;
  }
}

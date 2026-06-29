export class MongoCommunityQueryUtils {
  private constructor() {}

  static escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  static calculateTotalPages(total: number, limit: number): number {
    return Math.max(Math.ceil(total / limit), 1)
  }

  static publicTrackerVisibilityQuery(): Record<string, unknown> {
    return {
      deletedAt: null,
      visibility: 'public',
      publishedAt: { $ne: null },
    }
  }
}

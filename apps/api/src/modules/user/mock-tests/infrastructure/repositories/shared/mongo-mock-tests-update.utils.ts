export class MongoMockTestsUpdateUtils {
  private constructor() {}

  static setIfDefined(
    target: Record<string, unknown>,
    source: Record<string, unknown>,
    key: string
  ): void {
    if (source[key] !== undefined) {
      target[key] = source[key];
    }
  }
}

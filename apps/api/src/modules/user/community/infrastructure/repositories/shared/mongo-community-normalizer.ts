export class MongoCommunityNormalizer {
  private constructor() {}

  static search(value?: string): string | undefined {
    const clean = value?.trim()

    if (!clean) {
      return undefined
    }

    return clean.slice(0, 120)
  }

  static topic(topic: string): string {
    return topic.trim().toLowerCase()
  }
}

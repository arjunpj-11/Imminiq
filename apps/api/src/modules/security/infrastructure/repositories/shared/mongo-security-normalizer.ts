export class MongoSecurityNormalizer {
  private constructor() {}

  static email(email: string): string {
    return email.toLowerCase().trim();
  }
}

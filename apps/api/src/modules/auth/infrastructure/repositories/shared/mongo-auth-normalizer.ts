export class MongoAuthNormalizer {
  private constructor() {}

  static email(email: string): string {
    return email.toLowerCase().trim();
  }

  static username(username: string): string {
    return username.toLowerCase().trim();
  }

  static phone(phone: string): string {
    return phone.trim().replace(/\s/g, '');
  }

  static text(value: string): string {
    return value.trim();
  }
}

export interface PasswordHasherContract {
  hash(value: string): Promise<string>
  compare(value: string, hashedValue: string): Promise<boolean>
}

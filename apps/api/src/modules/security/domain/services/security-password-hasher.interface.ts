export interface SecurityPasswordHasherContract {
  hash(value: string): Promise<string>
  compare(value: string, hashedValue: string): Promise<boolean>
}

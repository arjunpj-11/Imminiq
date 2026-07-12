export interface ISecurityPasswordHasher {
  hash(value: string): Promise<string>
  compare(value: string, hashedValue: string): Promise<boolean>
}

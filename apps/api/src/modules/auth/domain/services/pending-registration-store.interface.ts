export type PendingRegistration = {
  fullName: string
  email?: string
  phone?: string
  passwordHash: string
}

export interface IPendingRegistrationStore {
  save(
    identifier: string,
    registration: PendingRegistration,
    ttlSeconds: number
  ): Promise<void>

  get(identifier: string): Promise<PendingRegistration | null>

  exists(identifier: string): Promise<boolean>

  delete(identifier: string): Promise<void>
}

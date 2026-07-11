import type { AuthSessionEntity } from '../../domain/entities/auth-session.entity'
import type { IAuthSessionDTO } from '../dtos/auth.dto'

export interface IAuthSessionMapper {
  toDto(session: AuthSessionEntity): IAuthSessionDTO
}

export class AuthSessionMapper implements IAuthSessionMapper {
  toDto(session: AuthSessionEntity): IAuthSessionDTO {
    return {
      id: session.id,
      expiresAt: session.expiresAt.toISOString(),
      revokedAt: session.revokedAt?.toISOString() ?? null,
      ...(session.device !== undefined ? { device: session.device } : {}),
      ...(session.ipAddress !== undefined ? { ipAddress: session.ipAddress } : {}),
      ...(session.userAgent !== undefined ? { userAgent: session.userAgent } : {}),
      createdAt: session.createdAt?.toISOString() ?? null,
    }
  }
}

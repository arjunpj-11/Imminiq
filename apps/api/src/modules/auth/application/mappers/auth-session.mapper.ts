import type { AuthSessionEntity } from '../../domain/entities/auth-session.entity'
import type { AuthSessionDto } from '../dtos/auth.dto'

export interface AuthSessionMapperContract {
  toDto(session: AuthSessionEntity): AuthSessionDto
}

export class AuthSessionMapper implements AuthSessionMapperContract {
  toDto(session: AuthSessionEntity): AuthSessionDto {
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

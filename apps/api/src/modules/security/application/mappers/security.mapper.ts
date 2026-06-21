import type { SecuritySessionEntity } from '../../domain/entities/security-session.entity'
import type { SecuritySessionDto } from '../dtos/security.dto'

export interface SecurityMapperContract {
  toSessionDto(
    session: SecuritySessionEntity,
    currentSessionId?: string | null,
  ): SecuritySessionDto
}

export class SecurityMapper implements SecurityMapperContract {
  toSessionDto(
    session: SecuritySessionEntity,
    currentSessionId?: string | null,
  ): SecuritySessionDto {
    return {
      id: session.id,
      deviceName: session.device ?? 'Unknown device',
      location: session.ipAddress ?? 'Unknown location',
      client: session.userAgent ?? 'Unknown client',
      lastActive: session.updatedAt?.toISOString() ?? 'Unknown',
      current: currentSessionId === session.id,
    }
  }
}

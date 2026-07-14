import type { SecuritySessionEntity } from '../domain/entities/security-session.entity';
import type { SecuritySessionDTO } from './security.dto';

export interface ISecurityMapper {
  toSessionDto(
    session: SecuritySessionEntity,
    currentSessionId?: string | null
  ): SecuritySessionDTO;
}

export class SecurityMapper implements ISecurityMapper {
  toSessionDto(
    session: SecuritySessionEntity,
    currentSessionId?: string | null
  ): SecuritySessionDTO {
    return {
      id: session.id,
      deviceName: session.device ?? 'Unknown device',
      location: session.ipAddress ?? 'Unknown location',
      client: session.userAgent ?? 'Unknown client',
      lastActive: session.updatedAt?.toISOString() ?? 'Unknown',
      current: currentSessionId === session.id,
    };
  }
}

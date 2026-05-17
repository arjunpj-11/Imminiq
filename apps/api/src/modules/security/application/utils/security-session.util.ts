import type {
  SecuritySession,
  SessionRecord,
} from '../../domain/types/security.types'

export const formatSessionDate = (date?: Date | null): string => {
  if (!date) {
    return 'Unknown'
  }

  return date.toISOString()
}

export const mapSession = (
  session: SessionRecord,
  currentSessionId?: string | null
): SecuritySession => {
  const sessionId = String(session._id)

  return {
    id: sessionId,
    deviceName: session.device ?? 'Unknown device',
    location: session.ipAddress ?? 'Unknown location',
    client: session.userAgent ?? 'Unknown client',
    lastActive: formatSessionDate(session.updatedAt),
    current: currentSessionId === sessionId,
  }
}

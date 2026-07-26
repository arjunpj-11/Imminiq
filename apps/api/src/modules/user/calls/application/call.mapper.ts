import type { CallEntity } from '../domain/entities/call.entity';
import type { CallParticipantEntity } from '../domain/entities/call-participant.entity';
import type { CallParticipantDTO, CallViewDTO } from './call.dto';

export interface ICallMapper {
  toView(
    call: CallEntity,
    caller: CallParticipantEntity,
    callee: CallParticipantEntity,
    viewerUserId: string,
    hideOtherParticipantPrivateDetails?: boolean
  ): CallViewDTO;
}

const initials = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'IM';

const toParticipantView = (
  participant: CallParticipantEntity,
  hidePrivateDetails = false
): CallParticipantDTO => ({
  id: participant.id,
  fullName: participant.fullName,
  username: participant.username,
  handle: `@${participant.username}`,
  initials: initials(participant.fullName || participant.username),
  avatarUrl: hidePrivateDetails ? null : participant.avatarUrl,
});

export class CallMapper implements ICallMapper {
  toView(
    call: CallEntity,
    caller: CallParticipantEntity,
    callee: CallParticipantEntity,
    viewerUserId: string,
    hideOtherParticipantPrivateDetails = false
  ): CallViewDTO {
    const outgoing = call.callerId === viewerUserId;
    const callerView = toParticipantView(caller, !outgoing && hideOtherParticipantPrivateDetails);
    const calleeView = toParticipantView(callee, outgoing && hideOtherParticipantPrivateDetails);
    return {
      id: call.id,
      type: call.type,
      reason: call.reason,
      status: call.status,
      direction: outgoing ? 'outgoing' : 'incoming',
      caller: callerView,
      callee: calleeView,
      otherParticipant: outgoing ? calleeView : callerView,
      acceptedAt: call.acceptedAt,
      endedAt: call.endedAt,
      durationSeconds: call.durationSeconds,
      expiresAt: call.expiresAt,
      createdAt: call.createdAt,
      updatedAt: call.updatedAt,
    };
  }
}

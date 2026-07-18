import type {
  TrackerClanMessage,
  TrackerClanOverview,
  TrackerCloneSyncResult,
} from '../domain';
import type {
  DeleteClanSubtopicPayloadDTO,
  DeleteClanTopicPayloadDTO,
  ListClanMessagesPayloadDTO,
  RemoveClanMemberPayloadDTO,
  RespondToClanRoleInvitationPayloadDTO,
  ReviewClanJoinPayloadDTO,
  TrackerAccessPayloadDTO,
  TransferClanOwnershipPayloadDTO,
  UpdateClanMemberRolePayloadDTO,
  UpdateClanTopicPayloadDTO,
} from './tracker.dto';

export interface ITrackerClanServiceContract {
  getOverview(input: TrackerAccessPayloadDTO): Promise<TrackerClanOverview>;
  requestJoin(input: TrackerAccessPayloadDTO): Promise<TrackerClanOverview>;
  reviewJoin(input: ReviewClanJoinPayloadDTO): Promise<TrackerClanOverview>;
  updateMemberRole(input: UpdateClanMemberRolePayloadDTO): Promise<TrackerClanOverview>;
  removeMember(input: RemoveClanMemberPayloadDTO): Promise<TrackerClanOverview>;
  leaveClan(input: TrackerAccessPayloadDTO): Promise<TrackerClanOverview>;
  transferOwnership(input: TransferClanOwnershipPayloadDTO): Promise<TrackerClanOverview>;
  respondToRoleInvitation(
    input: RespondToClanRoleInvitationPayloadDTO
  ): Promise<TrackerClanOverview>;
  syncPersonalClone(input: TrackerAccessPayloadDTO): Promise<TrackerCloneSyncResult>;
  updateTopic(input: UpdateClanTopicPayloadDTO): Promise<void>;
  deleteTopic(input: DeleteClanTopicPayloadDTO): Promise<void>;
  deleteSubtopic(input: DeleteClanSubtopicPayloadDTO): Promise<void>;
  listMessages(input: ListClanMessagesPayloadDTO): Promise<TrackerClanMessage[]>;
}

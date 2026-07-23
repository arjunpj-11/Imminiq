export type ChatConversationEntityProps = {
  id: string;
  participantIds: string[];
  lastMessageId?: string | null;
  lastMessageAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class ChatConversationEntity {
  readonly id: string;
  readonly participantIds: string[];
  readonly lastMessageId: string | null;
  readonly lastMessageAt: Date | null;
  readonly deletedAt?: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ChatConversationEntityProps) {
    this.id = props.id;
    this.participantIds = [...props.participantIds];
    this.lastMessageId = props.lastMessageId ?? null;
    this.lastMessageAt = props.lastMessageAt ?? null;
    if (props.deletedAt !== undefined) this.deletedAt = props.deletedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  otherParticipantId(viewerUserId: string): string | null {
    return this.participantIds.find((participantId) => participantId !== viewerUserId) ?? null;
  }
}

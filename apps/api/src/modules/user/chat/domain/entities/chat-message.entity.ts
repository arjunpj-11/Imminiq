import type {
  ChatMessageKind,
  SharedProfile,
  SharedTracker,
  StoredChatFile,
} from '../chat.types';

export type ChatMessageEntityProps = {
  id: string;
  conversationId: string;
  senderId: string;
  kind: ChatMessageKind;
  text: string;
  codeLanguage?: string | null;
  attachment?: StoredChatFile | null;
  sharedTracker?: SharedTracker | null;
  sharedProfile?: SharedProfile | null;
  forwardedFromMessageId?: string | null;
  readBy: string[];
  starredBy?: string[];
  clearedFor?: string[];
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class ChatMessageEntity {
  readonly id: string;
  readonly conversationId: string;
  readonly senderId: string;
  readonly kind: ChatMessageKind;
  readonly text: string;
  readonly codeLanguage: string | null;
  readonly attachment: StoredChatFile | null;
  readonly sharedTracker: SharedTracker | null;
  readonly sharedProfile: SharedProfile | null;
  readonly forwardedFromMessageId: string | null;
  readonly readBy: string[];
  readonly starredBy: string[];
  readonly clearedFor: string[];
  readonly deletedAt?: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ChatMessageEntityProps) {
    this.id = props.id;
    this.conversationId = props.conversationId;
    this.senderId = props.senderId;
    this.kind = props.kind;
    this.text = props.text;
    this.codeLanguage = props.codeLanguage ?? null;
    this.attachment = props.attachment ?? null;
    this.sharedTracker = props.sharedTracker ?? null;
    this.sharedProfile = props.sharedProfile ?? null;
    this.forwardedFromMessageId = props.forwardedFromMessageId ?? null;
    this.readBy = [...props.readBy];
    this.starredBy = [...(props.starredBy ?? [])];
    this.clearedFor = [...(props.clearedFor ?? [])];
    if (props.deletedAt !== undefined) this.deletedAt = props.deletedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isReadByAnotherParticipant(): boolean {
    return this.readBy.some((userId) => userId !== this.senderId);
  }

  isStarredBy(userId: string): boolean {
    return this.starredBy.includes(userId);
  }
}

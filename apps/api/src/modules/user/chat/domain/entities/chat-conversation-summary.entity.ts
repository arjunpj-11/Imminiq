import type { ChatConversationEntity } from './chat-conversation.entity';
import type { ChatMessageEntity } from './chat-message.entity';
import type { ChatParticipantEntity } from './chat-participant.entity';

export type ChatConversationSummaryEntityProps = {
  conversation: ChatConversationEntity;
  participant: ChatParticipantEntity;
  lastMessage?: ChatMessageEntity | null;
  unreadCount: number;
};

export class ChatConversationSummaryEntity {
  readonly conversation: ChatConversationEntity;
  readonly participant: ChatParticipantEntity;
  readonly lastMessage: ChatMessageEntity | null;
  readonly unreadCount: number;

  constructor(props: ChatConversationSummaryEntityProps) {
    this.conversation = props.conversation;
    this.participant = props.participant;
    this.lastMessage = props.lastMessage ?? null;
    this.unreadCount = Math.max(0, props.unreadCount);
  }
}

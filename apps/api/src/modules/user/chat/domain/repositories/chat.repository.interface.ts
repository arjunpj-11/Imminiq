import type { IChatConversationCommandRepository } from './chat-conversation-command.repository.interface';
import type { IChatConversationQueryRepository } from './chat-conversation-query.repository.interface';
import type { IChatMessageCommandRepository } from './chat-message-command.repository.interface';
import type { IChatMessageQueryRepository } from './chat-message-query.repository.interface';
import type { IChatParticipantRepository } from './chat-participant.repository.interface';
import type { IChatRelationshipRepository } from './chat-relationship.repository.interface';

export interface IChatRepository
  extends
    IChatConversationQueryRepository,
    IChatConversationCommandRepository,
    IChatMessageQueryRepository,
    IChatMessageCommandRepository,
    IChatParticipantRepository,
    IChatRelationshipRepository {}

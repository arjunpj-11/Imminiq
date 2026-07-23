import { CallMapper } from './application/call.mapper';
import { CallViewService } from './application/services/call-view.service';
import type { CallsUseCases } from './application/calls-use-cases.contract';
import { EndCallUseCase } from './application/use-cases/end-call.usecase';
import { ExpireCallUseCase } from './application/use-cases/expire-call.usecase';
import { GetActiveCallUseCase } from './application/use-cases/get-active-call.usecase';
import { InitiateCallUseCase } from './application/use-cases/initiate-call.usecase';
import { ListCallsUseCase } from './application/use-cases/list-calls.usecase';
import { RespondCallUseCase } from './application/use-cases/respond-call.usecase';
import { mongoCallParticipantRepository } from './infrastructure/repositories/internal/mongo-call-participant.repository';
import { mongoCallRelationshipRepository } from './infrastructure/repositories/internal/mongo-call-relationship.repository';
import { mongoCallRepository } from './infrastructure/repositories/internal/mongo-call.repository';
import { NodeCallTimeoutScheduler } from './infrastructure/services/node-call-timeout.scheduler';
import { socketCallRealtimePublisher } from './infrastructure/services/socket-call-realtime.publisher';

export type CallsComposition = {
  useCases: CallsUseCases;
};

export const createCallsComposition = (): CallsComposition => {
  const mapper = new CallMapper();
  const views = new CallViewService(
    mongoCallParticipantRepository,
    mongoCallRelationshipRepository,
    mapper
  );
  const expire = new ExpireCallUseCase(
    mongoCallRepository,
    mongoCallRepository,
    views,
    socketCallRealtimePublisher
  );
  const timeouts = new NodeCallTimeoutScheduler((callId) => expire.execute(callId));

  return {
    useCases: {
      getActiveCall: new GetActiveCallUseCase(mongoCallRepository, views),
      listCalls: new ListCallsUseCase(mongoCallRepository, views),
      initiateCall: new InitiateCallUseCase(
        mongoCallRepository,
        mongoCallRepository,
        mongoCallRelationshipRepository,
        views,
        socketCallRealtimePublisher,
        timeouts
      ),
      respondCall: new RespondCallUseCase(
        mongoCallRepository,
        mongoCallRepository,
        views,
        socketCallRealtimePublisher,
        timeouts
      ),
      endCall: new EndCallUseCase(
        mongoCallRepository,
        mongoCallRepository,
        views,
        socketCallRealtimePublisher,
        timeouts
      ),
    },
  };
};

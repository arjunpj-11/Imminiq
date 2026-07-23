import { CallMapper } from './application/call.mapper';
import { env } from '../../../config/env';
import { CallViewService } from './application/services/call-view.service';
import type { CallsUseCases } from './application/calls-use-cases.contract';
import { EndCallUseCase } from './application/use-cases/end-call.usecase';
import { ExpireCallUseCase } from './application/use-cases/expire-call.usecase';
import { GetActiveCallUseCase } from './application/use-cases/get-active-call.usecase';
import { GetCallIceServersUseCase } from './application/use-cases/get-call-ice-servers.usecase';
import { InitiateCallUseCase } from './application/use-cases/initiate-call.usecase';
import { ListCallsUseCase } from './application/use-cases/list-calls.usecase';
import { RespondCallUseCase } from './application/use-cases/respond-call.usecase';
import { mongoCallParticipantRepository } from './infrastructure/repositories/internal/mongo-call-participant.repository';
import { mongoCallRelationshipRepository } from './infrastructure/repositories/internal/mongo-call-relationship.repository';
import { mongoCallRepository } from './infrastructure/repositories/internal/mongo-call.repository';
import { NodeCallTimeoutScheduler } from './infrastructure/services/node-call-timeout.scheduler';
import { socketCallRealtimePublisher } from './infrastructure/services/socket-call-realtime.publisher';
import { DirectCallIceServerProvider } from './infrastructure/services/direct-call-ice-server.provider';
import { MeteredCallIceServerProvider } from './infrastructure/services/metered-call-ice-server.provider';

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
  const iceServerProvider =
    env.METERED_TURN_API_BASE_URL && env.METERED_TURN_SECRET_KEY
      ? new MeteredCallIceServerProvider({
          apiBaseUrl: env.METERED_TURN_API_BASE_URL,
          secretKey: env.METERED_TURN_SECRET_KEY,
          credentialTtlSeconds: env.METERED_TURN_CREDENTIAL_TTL_SECONDS,
          requestTimeoutMs: env.METERED_TURN_REQUEST_TIMEOUT_MS,
        })
      : new DirectCallIceServerProvider();

  return {
    useCases: {
      getActiveCall: new GetActiveCallUseCase(mongoCallRepository, views),
      getIceServers: new GetCallIceServersUseCase(
        iceServerProvider,
        env.METERED_TURN_API_BASE_URL ? env.METERED_TURN_CREDENTIAL_TTL_SECONDS : null
      ),
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

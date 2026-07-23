import type * as Application from './index';

export type CallsUseCases = {
  getActiveCall: Application.IGetActiveCallUseCase;
  listCalls: Application.IListCallsUseCase;
  initiateCall: Application.IInitiateCallUseCase;
  respondCall: Application.IRespondCallUseCase;
  endCall: Application.IEndCallUseCase;
};

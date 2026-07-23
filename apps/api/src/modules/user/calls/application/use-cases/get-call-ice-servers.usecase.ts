import type { ICallIceServerProvider } from '../../domain/services/call-ice-server.provider.interface';
import type { CallIceConfigurationDTO } from '../call.dto';

export interface IGetCallIceServersUseCase {
  execute(userId: string): Promise<CallIceConfigurationDTO>;
}

export class GetCallIceServersUseCase implements IGetCallIceServersUseCase {
  constructor(
    private readonly _provider: ICallIceServerProvider,
    private readonly _expiresInSeconds: number | null
  ) {}

  async execute(userId: string): Promise<CallIceConfigurationDTO> {
    return {
      iceServers: await this._provider.getIceServers(userId),
      expiresInSeconds: this._expiresInSeconds,
    };
  }
}

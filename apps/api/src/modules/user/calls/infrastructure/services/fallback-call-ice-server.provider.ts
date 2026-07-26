import type {
  CallIceServer,
  ICallIceServerProvider,
} from '../../domain/services/call-ice-server.provider.interface';
import { ServiceError } from '../../../../../shared/errors/service.error';

export class FallbackCallIceServerProvider implements ICallIceServerProvider {
  constructor(
    private readonly _primary: ICallIceServerProvider,
    private readonly _fallback: ICallIceServerProvider
  ) {}

  async getIceServers(userId: string): Promise<CallIceServer[]> {
    try {
      return await this._primary.getIceServers(userId);
    } catch (error) {
      if (!(error instanceof ServiceError) || error.kind !== 'dependency-unavailable') {
        throw error;
      }
      return this._fallback.getIceServers(userId);
    }
  }
}

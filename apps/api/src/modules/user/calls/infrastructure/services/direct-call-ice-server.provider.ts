import type {
  CallIceServer,
  ICallIceServerProvider,
} from '../../domain/services/call-ice-server.provider.interface';

export class DirectCallIceServerProvider implements ICallIceServerProvider {
  async getIceServers(): Promise<CallIceServer[]> {
    return [];
  }
}

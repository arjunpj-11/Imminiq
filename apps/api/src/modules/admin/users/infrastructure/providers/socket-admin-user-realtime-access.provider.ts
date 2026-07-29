import { disconnectUserSockets } from '../../../../../infrastructure/realtime/socket';
import type { IAdminUserRealtimeAccessProvider } from '../../domain/services/admin-user-realtime-access-provider.interface';

class SocketAdminUserRealtimeAccessProvider implements IAdminUserRealtimeAccessProvider {
  async disconnectUser(userId: string) {
    disconnectUserSockets(userId);
  }
}

export const socketAdminUserRealtimeAccessProvider = new SocketAdminUserRealtimeAccessProvider();

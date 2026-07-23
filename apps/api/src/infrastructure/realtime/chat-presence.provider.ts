import type { IChatPresenceProvider } from '../../modules/user/chat';

export class InMemoryChatPresenceProvider implements IChatPresenceProvider {
  private readonly _connectionsByUser = new Map<string, Set<string>>();

  connect(userId: string, connectionId: string): boolean {
    const connections = this._connectionsByUser.get(userId) ?? new Set<string>();
    const wasOffline = connections.size === 0;
    connections.add(connectionId);
    this._connectionsByUser.set(userId, connections);
    return wasOffline;
  }

  disconnect(userId: string, connectionId: string): boolean {
    const connections = this._connectionsByUser.get(userId);
    if (!connections) return false;
    connections.delete(connectionId);
    if (connections.size > 0) return false;
    this._connectionsByUser.delete(userId);
    return true;
  }

  isOnline(userId: string): boolean {
    return (this._connectionsByUser.get(userId)?.size ?? 0) > 0;
  }
}

export const chatPresenceProvider = new InMemoryChatPresenceProvider();

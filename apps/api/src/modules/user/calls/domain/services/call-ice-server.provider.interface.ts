export type CallIceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

export interface ICallIceServerProvider {
  getIceServers(userId: string): Promise<CallIceServer[]>;
}

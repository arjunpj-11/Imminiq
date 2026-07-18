export const SOCKET_PATH = '/api/socket.io';

export const resolveSocketOrigin = (apiUrl: string, browserOrigin: string) => {
  return new URL(apiUrl, browserOrigin).origin;
};

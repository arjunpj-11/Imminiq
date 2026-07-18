import { io } from 'socket.io-client';
import { webEnvironment } from '../config/env';
import { resolveSocketOrigin, SOCKET_PATH } from './socket-url';

export const socket = io(
  resolveSocketOrigin(webEnvironment.socketUrl ?? webEnvironment.apiUrl, window.location.origin),
  {
    autoConnect: false,
    withCredentials: true,
    path: SOCKET_PATH,
  }
);

import { io } from 'socket.io-client';
import { webEnvironment } from '../config/env';

export const socket = io(webEnvironment.apiUrl, {
  autoConnect: false,
  withCredentials: true,
});

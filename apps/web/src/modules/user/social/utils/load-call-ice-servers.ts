import { webEnvironment } from '../../../../config/env';
import api from '../../../../lib/axios';
import { CALL_ENDPOINTS } from '../constants/calls.constants';
import type { ICallApiResponse, ICallIceConfiguration } from '../types/call.types';

const directConnectionFallback = (): RTCIceServer[] => [
  { urls: webEnvironment.webrtcStunUrl },
];

export const loadCallIceServers = async (): Promise<RTCIceServer[]> => {
  try {
    const response = await api.get<ICallApiResponse<ICallIceConfiguration>>(
      CALL_ENDPOINTS.iceServers
    );
    return response.data.data.iceServers.length
      ? response.data.data.iceServers
      : directConnectionFallback();
  } catch {
    return directConnectionFallback();
  }
};

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { CallSignal } from '../../../../../src/modules/user/social/types/call.types';
import { WebRtcCallService } from '../../../../../src/modules/user/social/utils/web-rtc-call.service';

class FakePeerConnection {
  remoteDescription: RTCSessionDescriptionInit | null = null;
  connectionState: RTCPeerConnectionState = 'new';
  onicecandidate: ((event: RTCPeerConnectionIceEvent) => void) | null = null;
  ontrack: ((event: RTCTrackEvent) => void) | null = null;
  onconnectionstatechange: (() => void) | null = null;
  setRemoteDescription = vi.fn(async (description: RTCSessionDescriptionInit) => {
    this.remoteDescription = description;
  });
  createAnswer = vi.fn(async () => ({ type: 'answer' as const, sdp: 'answer-sdp' }));
  setLocalDescription = vi.fn(async () => undefined);
  createOffer = vi.fn(async () => ({ type: 'offer' as const, sdp: 'offer-sdp' }));
  addIceCandidate = vi.fn(async () => undefined);
  addTrack = vi.fn();
  close = vi.fn();
}

describe('WebRtcCallService', () => {
  const originalNavigator = globalThis.navigator;
  const originalPeerConnection = globalThis.RTCPeerConnection;

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
    globalThis.RTCPeerConnection = originalPeerConnection;
  });

  it('queues an early offer until media and the peer connection are ready', async () => {
    const peer = new FakePeerConnection();
    const track = { stop: vi.fn(), enabled: true } as unknown as MediaStreamTrack;
    const stream = {
      getTracks: () => [track],
      getAudioTracks: () => [track],
      getVideoTracks: () => [],
    } as unknown as MediaStream;
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) } },
    });
    class PeerConnectionConstructor {
      constructor() {
        return peer;
      }
    }
    globalThis.RTCPeerConnection = PeerConnectionConstructor as unknown as typeof RTCPeerConnection;

    const emitted: CallSignal[] = [];
    const service = new WebRtcCallService();
    service.setCallbacks({
      onSignal: (signal) => emitted.push(signal),
      onRemoteStream: vi.fn(),
      onConnectionState: vi.fn(),
    });

    await service.handleSignal({
      type: 'offer',
      description: { type: 'offer', sdp: 'offer-sdp' },
    });
    expect(peer.setRemoteDescription).not.toHaveBeenCalled();

    await service.prepare('audio', [{ urls: 'stun:example.test' }]);

    expect(peer.setRemoteDescription).toHaveBeenCalledWith({
      type: 'offer',
      sdp: 'offer-sdp',
    });
    expect(emitted).toEqual([
      {
        type: 'answer',
        description: { type: 'answer', sdp: 'answer-sdp' },
      },
    ]);
  });
});

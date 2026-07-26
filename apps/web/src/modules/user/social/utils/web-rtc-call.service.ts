import type { CallSignal, CallType } from '../types/call.types';
import { requestMediaPermission } from '../../../../lib/media-permissions';

export type WebRtcCallCallbacks = {
  onSignal: (signal: CallSignal) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionState: (state: RTCPeerConnectionState) => void;
};

export class WebRtcCallService {
  private _callbacks: WebRtcCallCallbacks | null = null;
  private _peer: RTCPeerConnection | null = null;
  private _localStream: MediaStream | null = null;
  private readonly _pendingCandidates: RTCIceCandidateInit[] = [];
  private readonly _pendingSignals: CallSignal[] = [];
  private _offerCreated = false;

  setCallbacks(callbacks: WebRtcCallCallbacks) {
    this._callbacks = callbacks;
  }

  get localStream(): MediaStream | null {
    return this._localStream;
  }

  async prepare(type: CallType, iceServers: RTCIceServer[]) {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Calling is not supported in this browser');
    }
    if (!this._localStream) {
      this._localStream = await requestMediaPermission({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: type === 'video',
      });
    }
    if (!this._peer) {
      const peer = new RTCPeerConnection({
        iceServers,
      });
      this._peer = peer;
      for (const track of this._localStream.getTracks()) {
        peer.addTrack(track, this._localStream);
      }
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          this._callbacks?.onSignal({
            type: 'ice-candidate',
            candidate: event.candidate.toJSON(),
          });
        }
      };
      peer.ontrack = (event) => {
        const stream = event.streams[0] ?? new MediaStream([event.track]);
        this._callbacks?.onRemoteStream(stream);
      };
      peer.onconnectionstatechange = () => {
        this._callbacks?.onConnectionState(peer.connectionState);
      };
      await this.flushSignals();
    }
    return this._localStream;
  }

  async createOffer() {
    if (!this._peer || this._offerCreated) return;
    this._offerCreated = true;
    const description = await this._peer.createOffer();
    await this._peer.setLocalDescription(description);
    this._callbacks?.onSignal({ type: 'offer', description });
  }

  async handleSignal(signal: CallSignal) {
    const peer = this._peer;
    if (!peer) {
      this._pendingSignals.push(signal);
      return;
    }
    await this.applySignal(peer, signal);
  }

  private async applySignal(peer: RTCPeerConnection, signal: CallSignal) {
    if (signal.type === 'offer') {
      await peer.setRemoteDescription(signal.description);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      this._callbacks?.onSignal({ type: 'answer', description: answer });
      await this.flushCandidates();
      return;
    }
    if (signal.type === 'answer') {
      await peer.setRemoteDescription(signal.description);
      await this.flushCandidates();
      return;
    }
    if (!peer.remoteDescription) {
      this._pendingCandidates.push(signal.candidate);
      return;
    }
    await peer.addIceCandidate(signal.candidate);
  }

  setAudioEnabled(enabled: boolean) {
    this._localStream?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  setVideoEnabled(enabled: boolean) {
    this._localStream?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  close() {
    this._peer?.close();
    this._peer = null;
    this._localStream?.getTracks().forEach((track) => track.stop());
    this._localStream = null;
    this._pendingCandidates.length = 0;
    this._pendingSignals.length = 0;
    this._offerCreated = false;
  }

  private async flushSignals() {
    const peer = this._peer;
    if (!peer) return;
    while (this._pendingSignals.length) {
      const signal = this._pendingSignals.shift();
      if (signal) await this.applySignal(peer, signal);
    }
  }

  private async flushCandidates() {
    if (!this._peer?.remoteDescription) return;
    while (this._pendingCandidates.length) {
      const candidate = this._pendingCandidates.shift();
      if (candidate) await this._peer.addIceCandidate(candidate);
    }
  }
}

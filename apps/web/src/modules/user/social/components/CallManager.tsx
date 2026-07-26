import { useQueryClient } from '@tanstack/react-query';
import {
  LoaderCircle,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Phone,
  PhoneOff,
  Volume2,
  Video,
  VideoOff,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';

import UserAvatar from '../../../../components/data-display/UserAvatar';
import Modal from '../../../../components/overlays/Modal';
import { cn } from '../../../../lib/cn';
import { socket } from '../../../../lib/socket';
import { toast } from '../../../../lib/toast';
import { useAuthStore } from '../../../../store/useAuthStore';
import { CALL_REASON_MAX_LENGTH } from '../constants/calls.constants';
import { socialQueryKeys } from '../hooks/social.query-keys';
import { useActiveCall, useEndCall, useInitiateCall, useRespondCall } from '../hooks/useCalls';
import { useCallLauncherStore } from '../store/useCallLauncherStore';
import type { CallSignal, CallType, ICall } from '../types/call.types';
import { loadCallIceServers } from '../utils/load-call-ice-servers';
import { WebRtcCallService } from '../utils/web-rtc-call.service';

const terminalStatuses = new Set(['declined', 'ended', 'missed', 'cancelled']);
const callQueryKeys = socialQueryKeys.calls;
type SinkSelectableMediaElement = HTMLMediaElement & {
  setSinkId?: (deviceId: string) => Promise<void>;
};

const formatCallDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

const callStatusLabel = (call: ICall, connectionState: RTCPeerConnectionState | 'idle') => {
  if (call.status === 'declined') return 'Call declined';
  if (call.status === 'missed') return 'Call not taken';
  if (call.status === 'cancelled') return 'Call cancelled';
  if (call.status === 'ended') return 'Call ended';
  if (call.status === 'ringing') {
    return call.direction === 'incoming'
      ? `Incoming ${call.type} call`
      : `Calling ${call.otherParticipant.fullName}…`;
  }
  return connectionState === 'connected' ? 'Connected' : 'Connecting…';
};

export default function CallManager() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const launchTarget = useCallLauncherStore((state) => state.target);
  const closeLauncher = useCallLauncherStore((state) => state.close);
  const client = useQueryClient();
  const activeQuery = useActiveCall(isAuthenticated);
  const initiate = useInitiateCall();
  const respond = useRespondCall();
  const endCall = useEndCall();

  const [reason, setReason] = useState('');
  const [activeCall, setActiveCallState] = useState<ICall | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | 'idle'>('idle');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [mediaPending, setMediaPending] = useState(false);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioOutput, setSelectedAudioOutput] = useState('default');
  const [clock, setClock] = useState(() => Date.now());

  const activeCallRef = useRef<ICall | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const terminalTimerRef = useRef<number | null>(null);
  const [callService] = useState(() => new WebRtcCallService());

  useEffect(() => {
    callService.setCallbacks({
      onSignal: (signal) => {
        const callId = activeCallRef.current?.id;
        if (callId) socket.emit('call:signal', { callId, signal });
      },
      onRemoteStream: setRemoteStream,
      onConnectionState: setConnectionState,
    });
  }, [callService]);

  const setActiveCall = useCallback(
    (call: ICall | null) => {
      activeCallRef.current = call;
      setActiveCallState(call);
      client.setQueryData(callQueryKeys.active(), call);
    },
    [client]
  );

  const clearTerminalTimer = useCallback(() => {
    if (terminalTimerRef.current !== null) {
      window.clearTimeout(terminalTimerRef.current);
      terminalTimerRef.current = null;
    }
  }, []);

  const closeMedia = useCallback(() => {
    callService.close();
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState('idle');
    setAudioEnabled(true);
    setVideoEnabled(true);
  }, [callService]);

  const dismissCall = useCallback(() => {
    clearTerminalTimer();
    closeMedia();
    setMinimized(false);
    setActiveCall(null);
  }, [clearTerminalTimer, closeMedia, setActiveCall]);

  const showTerminalCall = useCallback(
    (call: ICall) => {
      clearTerminalTimer();
      closeMedia();
      setMinimized(false);
      setActiveCall(call);
      terminalTimerRef.current = window.setTimeout(dismissCall, 4_500);
    },
    [clearTerminalTimer, closeMedia, dismissCall, setActiveCall]
  );

  const refreshAudioOutputs = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
        (device) => device.kind === 'audiooutput'
      );
      setAudioOutputs(devices);
      if (devices.length && !devices.some((device) => device.deviceId === selectedAudioOutput)) {
        setSelectedAudioOutput(devices[0]?.deviceId || 'default');
      }
    } catch {
      setAudioOutputs([]);
    }
  }, [selectedAudioOutput]);

  const prepareMedia = useCallback(
    async (type: CallType) => {
      setMediaPending(true);
      try {
        const iceServers = await loadCallIceServers();
        const stream = await callService.prepare(type, iceServers);
        setLocalStream(stream);
        await refreshAudioOutputs();
        return true;
      } catch (error) {
        toast.error(
          'Microphone or camera unavailable',
          error instanceof Error ? error.message : 'Allow media access and try again.'
        );
        return false;
      } finally {
        setMediaPending(false);
      }
    },
    [callService, refreshAudioOutputs]
  );

  const connectAcceptedCall = useCallback(
    async (call: ICall) => {
      const ready = localStream ? true : await prepareMedia(call.type);
      if (ready && call.direction === 'outgoing') {
        await callService.createOffer();
      }
    },
    [callService, localStream, prepareMedia]
  );

  useEffect(() => {
    if (activeQuery.data && !activeCallRef.current) {
      setActiveCall(activeQuery.data);
    }
  }, [activeQuery.data, setActiveCall]);

  useEffect(() => {
    if (activeCall?.status === 'accepted') {
      queueMicrotask(() => {
        const currentCall = activeCallRef.current;
        if (currentCall?.id === activeCall.id && currentCall.status === 'accepted') {
          void connectAcceptedCall(currentCall);
        }
      });
    }
  }, [activeCall, connectAcceptedCall]);

  useEffect(() => {
    if (activeCall?.status !== 'accepted' || !activeCall.acceptedAt) return undefined;
    const timer = window.setInterval(() => setClock(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [activeCall?.acceptedAt, activeCall?.status]);

  useEffect(() => {
    if (!launchTarget || !activeCall) return;
    toast.info('A call is already in progress', 'End or dismiss the current call first.');
    closeLauncher();
  }, [activeCall, closeLauncher, launchTarget]);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream, minimized, activeCall]);

  useEffect(() => {
    const receiveIncoming = (call: ICall) => {
      if (activeCallRef.current && activeCallRef.current.id !== call.id) return;
      clearTerminalTimer();
      setActiveCall(call);
      setMinimized(false);
    };
    const receiveUpdated = (call: ICall) => {
      if (activeCallRef.current && activeCallRef.current.id !== call.id) return;
      if (terminalStatuses.has(call.status)) {
        void client.invalidateQueries({ queryKey: callQueryKeys.historyRoot() });
        showTerminalCall(call);
        return;
      }
      setActiveCall(call);
      if (call.status === 'accepted') {
        void connectAcceptedCall(call);
      }
    };
    const receiveSignal = (event: { callId?: string; signal?: CallSignal }) => {
      const currentCall = activeCallRef.current;
      if (!currentCall || event.callId !== currentCall.id || !event.signal) {
        return;
      }
      void callService.handleSignal(event.signal).catch(() => {
        toast.error(
          'Call connection failed',
          'The peer-to-peer connection could not be completed.'
        );
      });
    };

    socket.on('call:incoming', receiveIncoming);
    socket.on('call:updated', receiveUpdated);
    socket.on('call:signal', receiveSignal);
    return () => {
      socket.off('call:incoming', receiveIncoming);
      socket.off('call:updated', receiveUpdated);
      socket.off('call:signal', receiveSignal);
    };
  }, [
    clearTerminalTimer,
    callService,
    client,
    connectAcceptedCall,
    setActiveCall,
    showTerminalCall,
  ]);

  useEffect(
    () => () => {
      clearTerminalTimer();
      callService.close();
    },
    [callService, clearTerminalTimer]
  );

  const submitReason = async (event: FormEvent) => {
    event.preventDefault();
    if (!launchTarget || reason.trim().length < 3 || initiate.isPending) return;
    if (!(await prepareMedia(launchTarget.type))) return;
    initiate.mutate(
      {
        calleeUserId: launchTarget.participant.id,
        type: launchTarget.type,
        reason: reason.trim(),
      },
      {
        onSuccess: (call) => {
          setActiveCall(call);
          setMinimized(false);
          setReason('');
          closeLauncher();
        },
        onError: (error) => {
          closeMedia();
          toast.error(
            'Could not start the call',
            error.response?.data?.message ?? 'Please try again.'
          );
        },
      }
    );
  };

  const acceptIncoming = async () => {
    const call = activeCallRef.current;
    if (!call || call.status !== 'ringing' || call.direction !== 'incoming') return;
    if (!(await prepareMedia(call.type))) return;
    respond.mutate(
      { callId: call.id, response: 'accept' },
      {
        onSuccess: setActiveCall,
        onError: (error) => {
          closeMedia();
          toast.error(
            'Could not answer',
            error.response?.data?.message ?? 'The call may have ended.'
          );
        },
      }
    );
  };

  const declineIncoming = () => {
    const call = activeCallRef.current;
    if (!call) return;
    respond.mutate(
      { callId: call.id, response: 'decline' },
      {
        onSuccess: showTerminalCall,
        onError: () => dismissCall(),
      }
    );
  };

  const finishCall = () => {
    const call = activeCallRef.current;
    if (!call) return;
    const outcome = call.status === 'accepted' ? 'ended' : 'cancelled';
    endCall.mutate(
      { callId: call.id, outcome },
      {
        onSuccess: showTerminalCall,
        onError: () => dismissCall(),
      }
    );
  };

  const selectAudioOutput = async (deviceId: string) => {
    const elements = [remoteAudioRef.current, remoteVideoRef.current].filter(
      (element): element is HTMLMediaElement => Boolean(element)
    );
    try {
      await Promise.all(
        elements.map((element) => {
          const selectable = element as SinkSelectableMediaElement;
          return selectable.setSinkId ? selectable.setSinkId(deviceId) : Promise.resolve();
        })
      );
      setSelectedAudioOutput(deviceId);
    } catch {
      toast.error(
        'Could not change audio output',
        'Choose a speaker from your browser or phone audio controls.'
      );
    }
  };

  if (launchTarget && !activeCall) {
    return (
      <Modal
        open
        onClose={() => {
          setReason('');
          closeLauncher();
        }}
        titleId="call-reason-title"
        preventClose={initiate.isPending}
        overlayClassName="z-190 bg-black/55"
        contentClassName="max-w-md rounded-2xl"
      >
        <form onSubmit={(event) => void submitReason(event)}>
          <div className="flex items-start gap-3">
            <UserAvatar
              name={launchTarget.participant.fullName}
              src={launchTarget.participant.avatarUrl}
              initials={launchTarget.participant.initials}
              profileUsername={launchTarget.participant.username}
              sizeClassName="h-12 w-12 text-[12px]"
            />
            <div className="min-w-0 flex-1">
              <h2 id="call-reason-title" className="m-0 text-[16px] font-bold">
                Start {launchTarget.type === 'audio' ? 'an' : 'a'} {launchTarget.type} call
              </h2>
              <p className="mb-0 mt-1 text-[11px] text-(--text-muted)">
                Tell {launchTarget.participant.fullName.split(' ')[0]} why you’re calling. They’ll
                see this before answering.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setReason('');
                closeLauncher();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-(--surface-muted)"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <label className="mt-5 block text-[10px] font-bold text-(--text-secondary)">
            Reason for calling
            <textarea
              autoFocus
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={CALL_REASON_MAX_LENGTH}
              rows={4}
              placeholder="For example: I need help with today’s lesson."
              className="mt-2 w-full resize-none rounded-xl border border-(--border-subtle) bg-(--surface-muted) px-3 py-3 text-[12px] leading-relaxed outline-none focus:border-(--brand-500)"
            />
          </label>
          <div className="mt-1 text-right font-mono text-[8px] text-(--text-muted)">
            {reason.length}/{CALL_REASON_MAX_LENGTH}
          </div>
          <button
            type="submit"
            disabled={reason.trim().length < 3 || initiate.isPending || mediaPending}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--brand-500) text-[11px] font-bold text-(--brand-contrast) disabled:opacity-45"
          >
            {initiate.isPending || mediaPending ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : launchTarget.type === 'video' ? (
              <Video size={16} />
            ) : (
              <Phone size={16} />
            )}
            {mediaPending
              ? 'Waiting for permission…'
              : initiate.isPending
                ? 'Starting…'
                : 'Start call'}
          </button>
        </form>
      </Modal>
    );
  }

  if (!activeCall) return null;

  const incomingRinging = activeCall.status === 'ringing' && activeCall.direction === 'incoming';
  const isTerminal = terminalStatuses.has(activeCall.status);
  const statusLabel = callStatusLabel(activeCall, connectionState);
  const elapsedSeconds =
    activeCall.status === 'accepted' && activeCall.acceptedAt
      ? Math.max(0, Math.floor((clock - new Date(activeCall.acceptedAt).getTime()) / 1_000))
      : (activeCall.durationSeconds ?? 0);
  const durationLabel =
    activeCall.status === 'accepted' || activeCall.status === 'ended'
      ? formatCallDuration(elapsedSeconds)
      : null;

  if (minimized) {
    return (
      <div className="fixed bottom-4 left-1/2 z-190 w-[min(94vw,560px)] -translate-x-1/2 rounded-xl border border-(--border-subtle) bg-(--surface-elevated) p-3 shadow-(--shadow-3)">
        <audio ref={remoteAudioRef} autoPlay playsInline />
        <div className="flex items-center gap-3">
          <span className="relative">
            <UserAvatar
              name={activeCall.otherParticipant.fullName}
              src={activeCall.otherParticipant.avatarUrl}
              initials={activeCall.otherParticipant.initials}
              profileUsername={activeCall.otherParticipant.username}
              sizeClassName="h-10 w-10 text-[10px]"
            />
            {activeCall.status === 'ringing' && (
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full bg-(--success)" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-bold">{statusLabel}</div>
            <div className="truncate text-[9px] text-(--text-muted)">
              {durationLabel ? `${durationLabel} · ` : ''}
              {activeCall.reason}
            </div>
          </div>
          {incomingRinging && (
            <button
              type="button"
              onClick={() => void acceptIncoming()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-(--success) text-white"
              aria-label="Answer call"
            >
              <Phone size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={incomingRinging ? declineIncoming : finishCall}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-(--danger) text-white"
            aria-label={incomingRinging ? 'Decline call' : 'End call'}
          >
            <PhoneOff size={15} />
          </button>
          <button
            type="button"
            onClick={() => setMinimized(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-(--surface-muted)"
            aria-label="Restore call"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <Modal
      open
      onClose={() => setMinimized(true)}
      closeOnBackdrop={false}
      ariaLabel={`${activeCall.type} call with ${activeCall.otherParticipant.fullName}`}
      overlayClassName="z-190 bg-black/65 p-3 backdrop-blur-md sm:p-6"
      contentClassName="relative flex h-[min(720px,92vh)] max-w-2xl flex-col overflow-hidden rounded-3xl border-white/10 bg-[#171918] p-0 text-white shadow-2xl"
    >
      <div className="absolute right-4 top-4 z-3">
        <button
          type="button"
          onClick={() => setMinimized(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur hover:bg-black/50"
          aria-label="Minimize call"
        >
          <Minimize2 size={17} />
        </button>
      </div>

      {activeCall.type === 'video' && activeCall.status === 'accepted' ? (
        <div className="relative min-h-0 flex-1 bg-black">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoaderCircle size={28} className="animate-spin text-white/60" />
            </div>
          )}
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 h-32 w-24 rounded-xl border border-white/20 bg-black object-cover shadow-xl sm:h-44 sm:w-32"
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-7 text-center">
          <div className="relative">
            <UserAvatar
              name={activeCall.otherParticipant.fullName}
              src={activeCall.otherParticipant.avatarUrl}
              initials={activeCall.otherParticipant.initials}
              profileUsername={activeCall.otherParticipant.username}
              sizeClassName="h-28 w-28 text-[28px]"
              imageLoading="eager"
            />
            {activeCall.status === 'ringing' && (
              <span className="absolute -inset-3 -z-1 animate-pulse rounded-full border border-white/20" />
            )}
          </div>
          <h2 className="mb-0 mt-6 text-[24px] font-bold tracking-[-0.03em]">
            {activeCall.otherParticipant.fullName}
          </h2>
          <p className="mb-0 mt-2 text-[12px] text-white/65">{statusLabel}</p>
          {durationLabel && (
            <p className="mb-0 mt-2 font-mono text-[11px] text-white/55">{durationLabel}</p>
          )}
          {activeCall.status === 'accepted' && !localStream && (
            <button
              type="button"
              onClick={() => void connectAcceptedCall(activeCall)}
              disabled={mediaPending}
              className="mt-5 rounded-full bg-white px-5 py-2.5 text-[11px] font-bold text-black disabled:opacity-50"
            >
              {mediaPending ? 'Connecting…' : 'Reconnect media'}
            </button>
          )}
        </div>
      )}

      <div className="shrink-0 border-t border-white/10 bg-black/30 px-5 py-4 backdrop-blur">
        <div className="mx-auto mb-4 max-w-lg rounded-xl bg-white/8 px-4 py-3 text-center">
          <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/45">
            Reason for calling
          </div>
          <div className="mt-1 text-[12px] leading-relaxed text-white/90">{activeCall.reason}</div>
        </div>

        <audio ref={remoteAudioRef} autoPlay playsInline />

        <div className="flex items-center justify-center gap-3">
          {incomingRinging ? (
            <>
              <button
                type="button"
                onClick={declineIncoming}
                disabled={respond.isPending}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d64b4b] text-white disabled:opacity-50"
                aria-label="Decline call"
              >
                <PhoneOff size={21} />
              </button>
              <button
                type="button"
                onClick={() => void acceptIncoming()}
                disabled={respond.isPending || mediaPending}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#36a26b] text-white disabled:opacity-50"
                aria-label="Answer call"
              >
                {respond.isPending || mediaPending ? (
                  <LoaderCircle size={20} className="animate-spin" />
                ) : activeCall.type === 'video' ? (
                  <Video size={21} />
                ) : (
                  <Phone size={21} />
                )}
              </button>
            </>
          ) : isTerminal ? (
            <button
              type="button"
              onClick={dismissCall}
              className="rounded-full bg-white px-6 py-3 text-[11px] font-bold text-black"
            >
              Close
            </button>
          ) : (
            <>
              {activeCall.status === 'accepted' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !audioEnabled;
                      setAudioEnabled(next);
                      callService.setAudioEnabled(next);
                    }}
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full',
                      audioEnabled ? 'bg-white/12' : 'bg-white text-black'
                    )}
                    aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                  >
                    {audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                  </button>
                  {'setSinkId' in HTMLMediaElement.prototype ? (
                    <label
                      className="relative flex h-12 min-w-12 items-center justify-center rounded-full bg-white/12 px-3"
                      title="Audio output"
                    >
                      <Volume2 size={18} className="shrink-0" />
                      <select
                        value={selectedAudioOutput}
                        onChange={(event) => void selectAudioOutput(event.target.value)}
                        className="absolute inset-0 cursor-pointer opacity-0"
                        aria-label="Choose call audio output"
                      >
                        {audioOutputs.length ? (
                          audioOutputs.map((device, index) => (
                            <option key={device.deviceId} value={device.deviceId}>
                              {device.label || `Audio output ${index + 1}`}
                            </option>
                          ))
                        ) : (
                          <option value="default">Default speaker</option>
                        )}
                      </select>
                      <span className="ml-1.5 max-w-20 truncate text-[9px] font-bold">Output</span>
                    </label>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        toast.info(
                          'Use device audio controls',
                          'This browser manages speaker and phone audio from the system call controls.'
                        )
                      }
                      className="flex h-12 items-center gap-1.5 rounded-full bg-white/12 px-3 text-[9px] font-bold"
                      aria-label="Audio output help"
                    >
                      <Volume2 size={18} />
                      Output
                    </button>
                  )}
                  {activeCall.type === 'video' && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = !videoEnabled;
                        setVideoEnabled(next);
                        callService.setVideoEnabled(next);
                      }}
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full',
                        videoEnabled ? 'bg-white/12' : 'bg-white text-black'
                      )}
                      aria-label={videoEnabled ? 'Turn camera off' : 'Turn camera on'}
                    >
                      {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                    </button>
                  )}
                </>
              )}
              <button
                type="button"
                onClick={finishCall}
                disabled={endCall.isPending}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d64b4b] text-white disabled:opacity-50"
                aria-label={activeCall.status === 'ringing' ? 'Cancel call' : 'End call'}
              >
                {endCall.isPending ? (
                  <LoaderCircle size={20} className="animate-spin" />
                ) : (
                  <PhoneOff size={21} />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';

import { CHAT_MAX_VOICE_DURATION_SECONDS } from '../constants/chat.constants';
import {
  explainMediaPermissionError,
  requestMediaPermission,
} from '../../../../lib/media-permissions';
import { calculateVoiceDurationSeconds } from '../utils/voice-recording-duration';

type RecordedVoiceMessage = {
  file: File;
  durationSeconds: number;
};

const selectMimeType = () =>
  ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((type) =>
    MediaRecorder.isTypeSupported(type)
  ) ?? '';

export const useVoiceMessageRecorder = (
  onRecorded: (recording: RecordedVoiceMessage) => void
) => {
  const [isRecording, setIsRecording] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [error, setError] = useState<string>();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startPendingRef = useRef(false);
  const chunksRef = useRef<Blob[]>([]);
  const discardRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const recordedHandlerRef = useRef(onRecorded);
  const supported =
    typeof MediaRecorder !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia);

  useEffect(() => {
    recordedHandlerRef.current = onRecorded;
  }, [onRecorded]);

  useEffect(() => {
    if (!isRecording) return undefined;
    const timer = window.setInterval(() => {
      const elapsedSeconds = Math.min(
        CHAT_MAX_VOICE_DURATION_SECONDS,
        Math.floor((Date.now() - (startedAtRef.current ?? Date.now())) / 1_000)
      );
      setDurationSeconds(elapsedSeconds);
      if (elapsedSeconds >= CHAT_MAX_VOICE_DURATION_SECONDS) {
        recorderRef.current?.stop();
      }
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  const release = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (
      !supported ||
      isRecording ||
      startPendingRef.current ||
      recorderRef.current?.state === 'recording'
    ) {
      return;
    }
    startPendingRef.current = true;
    try {
      const stream = await requestMediaPermission({ audio: true });
      const mimeType = selectMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType, audioBitsPerSecond: 64_000 } : undefined
      );
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      discardRef.current = false;
      startedAtRef.current = Date.now();
      setDurationSeconds(0);
      setError(undefined);
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        recorderRef.current = null;
        startedAtRef.current = null;
        release();
        setIsRecording(false);
        setError('Voice recording stopped unexpectedly.');
      };
      recorder.onstop = () => {
        const resolvedMimeType = recorder.mimeType || mimeType || 'audio/webm';
        const duration = calculateVoiceDurationSeconds(
          Date.now() - (startedAtRef.current ?? Date.now())
        );
        startedAtRef.current = null;
        const chunks = chunksRef.current;
        chunksRef.current = [];
        recorderRef.current = null;
        release();
        setIsRecording(false);
        if (discardRef.current || chunks.length === 0) return;
        const extension = resolvedMimeType.includes('mp4') ? 'm4a' : 'webm';
        recordedHandlerRef.current({
          file: new File([new Blob(chunks, { type: resolvedMimeType })], `voice-${Date.now()}.${extension}`, {
            type: resolvedMimeType.split(';')[0],
          }),
          durationSeconds: duration,
        });
      };
      recorder.start(250);
      setIsRecording(true);
    } catch (cause) {
      startedAtRef.current = null;
      release();
      setError(explainMediaPermissionError(cause, { audio: true }));
    } finally {
      startPendingRef.current = false;
    }
  }, [isRecording, release, supported]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }, []);

  const cancel = useCallback(() => {
    discardRef.current = true;
    stop();
  }, [stop]);

  useEffect(
    () => () => {
      discardRef.current = true;
      startPendingRef.current = false;
      startedAtRef.current = null;
      const recorder = recorderRef.current;
      if (recorder?.state === 'recording') {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.onerror = null;
        recorder.stop();
      }
      release();
    },
    [release]
  );

  return {
    isSupported: supported,
    isRecording,
    durationSeconds,
    error,
    start,
    stop,
    cancel,
  };
};

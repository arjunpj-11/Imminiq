import { useCallback, useEffect, useRef, useState } from 'react';

import api from '../lib/axios';
import { toast } from '../lib/toast';
import { VOICE_INPUT_ENDPOINTS } from './voice-input.constants';

type VoiceTranscriptResponse = {
  success: boolean;
  data: {
    text: string;
    language: string | null;
  };
};

const selectRecordingMimeType = () => {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return candidates.find((value) => MediaRecorder.isTypeSupported(value)) ?? '';
};

const recordingExtension = (mimeType: string) =>
  mimeType.includes('mp4') ? 'm4a' : 'webm';

export const useVoiceInput = (onTranscript: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(
    () =>
      typeof MediaRecorder !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      Boolean(navigator.mediaDevices?.getUserMedia)
  );
  const transcriptHandlerRef = useRef(onTranscript);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<number | null>(null);
  const startPendingRef = useRef(false);
  const processingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    transcriptHandlerRef.current = onTranscript;
  }, [onTranscript]);

  const clearTimer = useCallback(() => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  }, []);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const transcribe = useCallback(async (blob: Blob, mimeType: string) => {
    if (!blob.size) return;
    processingRef.current = true;
    try {
      const form = new FormData();
      form.set(
        'audio',
        new File(
          [blob],
          `voice-input-${Date.now()}.${recordingExtension(mimeType)}`,
          { type: mimeType.split(';')[0] }
        )
      );
      const response = await api.post<VoiceTranscriptResponse>(
        VOICE_INPUT_ENDPOINTS.transcriptions,
        form
      );
      const transcript = response.data.data.text.trim();
      if (transcript && mountedRef.current) transcriptHandlerRef.current(transcript);
    } catch {
      if (mountedRef.current) {
        toast.error(
          'Voice input could not be transcribed',
          'Please check your connection and try again.'
        );
      }
    } finally {
      processingRef.current = false;
      if (mountedRef.current) setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    clearTimer();
    const recorder = recorderRef.current;
    if (recorder?.state === 'recording') {
      recorder.stop();
      return;
    }
    releaseStream();
    setIsListening(false);
  }, [clearTimer, releaseStream]);

  const startListening = useCallback(async () => {
    if (
      !isSupported ||
      startPendingRef.current ||
      processingRef.current ||
      recorderRef.current?.state === 'recording'
    ) {
      return;
    }
    startPendingRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = selectRecordingMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType, audioBitsPerSecond: 64_000 } : undefined
      );
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        clearTimer();
        const resolvedMimeType = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: resolvedMimeType });
        chunksRef.current = [];
        recorderRef.current = null;
        releaseStream();
        void transcribe(blob, resolvedMimeType);
      };
      recorder.onerror = () => {
        clearTimer();
        recorderRef.current = null;
        releaseStream();
        setIsListening(false);
        toast.error('Microphone recording stopped', 'Please try voice input again.');
      };
      recorder.start(250);
      setIsListening(true);
      stopTimerRef.current = window.setTimeout(() => stopListening(), 60_000);
    } catch {
      setIsListening(false);
      toast.error(
        'Microphone unavailable',
        'Allow microphone access to use voice input.'
      );
    } finally {
      startPendingRef.current = false;
    }
  }, [clearTimer, isSupported, releaseStream, stopListening, transcribe]);

  const toggle = useCallback(() => {
    if (isListening) {
      stopListening();
      return;
    }
    void startListening();
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      startPendingRef.current = false;
      clearTimer();
      const recorder = recorderRef.current;
      if (recorder?.state === 'recording') {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.onerror = null;
        recorder.stop();
      }
      releaseStream();
    };
  }, [clearTimer, releaseStream]);

  return { isListening, isSupported, toggle };
};

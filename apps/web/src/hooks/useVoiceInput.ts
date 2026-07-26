import { useCallback, useEffect, useRef, useState } from 'react';

import api from '../lib/axios';
import { toast } from '../lib/toast';
import { explainMediaPermissionError, requestMediaPermission } from '../lib/media-permissions';
import { VOICE_INPUT_ENDPOINTS } from './voice-input.constants';

type VoiceTranscriptResponse = {
  success: boolean;
  data: {
    text: string;
    language: string | null;
  };
};

export type VoiceInputPhase = 'idle' | 'requesting' | 'listening' | 'transcribing';

const MICROPHONE_REQUEST_TIMEOUT_MS = 10_000;

const selectRecordingMimeType = () => {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return candidates.find((value) => MediaRecorder.isTypeSupported(value)) ?? '';
};

const recordingExtension = (mimeType: string) => (mimeType.includes('mp4') ? 'm4a' : 'webm');

export const useVoiceInput = (onTranscript: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [phase, setPhase] = useState<VoiceInputPhase>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
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
  const requestSequenceRef = useRef(0);
  const startPendingRef = useRef(false);
  const processingRef = useRef(false);
  const mountedRef = useRef(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioFrameRef = useRef<number | null>(null);

  useEffect(() => {
    transcriptHandlerRef.current = onTranscript;
  }, [onTranscript]);

  const clearTimer = useCallback(() => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  }, []);

  const stopAudioMeter = useCallback(() => {
    if (audioFrameRef.current !== null) {
      window.cancelAnimationFrame(audioFrameRef.current);
      audioFrameRef.current = null;
    }
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    if (mountedRef.current) setAudioLevel(0);
  }, []);

  const startAudioMeter = useCallback((stream: MediaStream) => {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.72;
    context.createMediaStreamSource(stream).connect(analyser);
    audioContextRef.current = context;
    const samples = new Uint8Array(analyser.fftSize);

    const measure = () => {
      analyser.getByteTimeDomainData(samples);
      let energy = 0;
      for (const sample of samples) {
        const normalized = (sample - 128) / 128;
        energy += normalized * normalized;
      }
      const rms = Math.sqrt(energy / samples.length);
      if (mountedRef.current) setAudioLevel(Math.min(1, rms * 5.5));
      audioFrameRef.current = window.requestAnimationFrame(measure);
    };

    measure();
  }, []);

  const releaseStream = useCallback(() => {
    stopAudioMeter();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, [stopAudioMeter]);

  const transcribe = useCallback(async (blob: Blob, mimeType: string) => {
    if (!blob.size) {
      if (mountedRef.current) setPhase('idle');
      return;
    }
    processingRef.current = true;
    if (mountedRef.current) setPhase('transcribing');
    try {
      const form = new FormData();
      form.set(
        'audio',
        new File([blob], `voice-input-${Date.now()}.${recordingExtension(mimeType)}`, {
          type: mimeType.split(';')[0],
        })
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
      if (mountedRef.current) {
        setIsListening(false);
        setPhase('idle');
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    clearTimer();
    const recorder = recorderRef.current;
    if (recorder?.state === 'recording') {
      setIsListening(false);
      setPhase('transcribing');
      recorder.stop();
      return;
    }
    releaseStream();
    setIsListening(false);
    setPhase('idle');
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
    const requestSequence = ++requestSequenceRef.current;
    let requestTimer: number | null = null;
    let requestTimedOut = false;
    startPendingRef.current = true;
    setPhase('requesting');
    try {
      const mediaRequest = requestMediaPermission({ audio: true });
      const requestTimeout = new Promise<never>((_resolve, reject) => {
        requestTimer = window.setTimeout(() => {
          requestTimedOut = true;
          reject(new Error('MICROPHONE_REQUEST_TIMEOUT'));
        }, MICROPHONE_REQUEST_TIMEOUT_MS);
      });
      void mediaRequest
        .then((lateStream) => {
          if (
            requestTimedOut ||
            !mountedRef.current ||
            requestSequence !== requestSequenceRef.current
          ) {
            lateStream.getTracks().forEach((track) => track.stop());
          }
        })
        .catch(() => undefined);
      const stream = await Promise.race([mediaRequest, requestTimeout]);
      if (!mountedRef.current || requestSequence !== requestSequenceRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const mimeType = selectRecordingMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType, audioBitsPerSecond: 64_000 } : undefined
      );
      streamRef.current = stream;
      startAudioMeter(stream);
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
        setPhase('idle');
        toast.error('Microphone recording stopped', 'Please try voice input again.');
      };
      recorder.start(250);
      setIsListening(true);
      setPhase('listening');
      stopTimerRef.current = window.setTimeout(() => stopListening(), 60_000);
    } catch (error) {
      if (mountedRef.current && requestSequence === requestSequenceRef.current) {
        setIsListening(false);
        setPhase('idle');
        toast.error(
          requestTimedOut ? 'Microphone request timed out' : 'Microphone unavailable',
          requestTimedOut
            ? 'No permission response was received. Please try again.'
            : explainMediaPermissionError(error, { audio: true })
        );
      }
    } finally {
      if (requestTimer !== null) window.clearTimeout(requestTimer);
      if (requestSequence === requestSequenceRef.current) {
        startPendingRef.current = false;
      }
    }
  }, [clearTimer, isSupported, releaseStream, startAudioMeter, stopListening, transcribe]);

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
      requestSequenceRef.current += 1;
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

  return {
    isListening,
    isTranscribing: phase === 'transcribing',
    isSupported,
    phase,
    audioLevel,
    toggle,
  };
};

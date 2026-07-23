import type { UploadedVoiceInput } from '../domain/voice-input.types';

export type TranscribeVoiceInputDTO = {
  audio: UploadedVoiceInput;
  language?: string;
};

export type VoiceTranscriptViewDTO = {
  text: string;
  language: string | null;
};

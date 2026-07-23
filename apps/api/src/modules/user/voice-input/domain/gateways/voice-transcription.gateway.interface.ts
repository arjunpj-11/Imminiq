import type { VoiceTranscriptEntity } from '../entities/voice-transcript.entity';
import type { UploadedVoiceInput } from '../voice-input.types';

export type TranscribeVoiceGatewayInput = {
  audio: UploadedVoiceInput;
  language?: string;
};

export interface IVoiceTranscriptionGateway {
  transcribe(input: TranscribeVoiceGatewayInput): Promise<VoiceTranscriptEntity>;
}

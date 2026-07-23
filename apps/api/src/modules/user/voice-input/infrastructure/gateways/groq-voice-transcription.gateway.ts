import { env } from '../../../../../config/env';
import { groq } from '../../../../../infrastructure/ai/clients/groq.client';
import { VoiceTranscriptEntity } from '../../domain/entities/voice-transcript.entity';
import type {
  IVoiceTranscriptionGateway,
  TranscribeVoiceGatewayInput,
} from '../../domain/gateways/voice-transcription.gateway.interface';
import { VoiceInputDomainError } from '../../domain/voice-input-domain.error';

export class GroqVoiceTranscriptionGateway implements IVoiceTranscriptionGateway {
  async transcribe(input: TranscribeVoiceGatewayInput) {
    try {
      const file = new File([new Uint8Array(input.audio.buffer)], input.audio.originalName, {
        type: input.audio.mimeType,
      });
      const response = await groq.audio.transcriptions.create({
        file,
        model: env.GROQ_TRANSCRIPTION_MODEL,
        response_format: 'json',
        temperature: 0,
        ...(input.language ? { language: input.language } : {}),
      });
      return new VoiceTranscriptEntity({
        text: response.text ?? '',
        language: input.language ?? null,
      });
    } catch {
      throw new VoiceInputDomainError(
        'VOICE_TRANSCRIPTION_PROVIDER_FAILED',
        'The speech transcription provider failed'
      );
    }
  }
}

export const groqVoiceTranscriptionGateway = new GroqVoiceTranscriptionGateway();

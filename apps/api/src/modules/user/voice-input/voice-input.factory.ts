import { TranscribeVoiceInputUseCase } from './application/use-cases/transcribe-voice-input.usecase';
import type { VoiceInputUseCases } from './application/voice-input-use-cases.contract';
import { VoiceInputMapper } from './application/voice-input.mapper';
import { groqVoiceTranscriptionGateway } from './infrastructure/gateways/groq-voice-transcription.gateway';

export type VoiceInputComposition = {
  useCases: VoiceInputUseCases;
};

export const createVoiceInputComposition = (): VoiceInputComposition => {
  const mapper = new VoiceInputMapper();
  return {
    useCases: {
      transcribe: new TranscribeVoiceInputUseCase(
        groqVoiceTranscriptionGateway,
        mapper
      ),
    },
  };
};

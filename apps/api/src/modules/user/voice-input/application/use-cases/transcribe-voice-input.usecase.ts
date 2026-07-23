import type { IVoiceTranscriptionGateway } from '../../domain/gateways/voice-transcription.gateway.interface';
import type {
  TranscribeVoiceInputDTO,
  VoiceTranscriptViewDTO,
} from '../voice-input.dto';
import { VoiceInputApplicationError } from '../voice-input-application.error';
import type { IVoiceInputMapper } from '../voice-input.mapper';

export interface ITranscribeVoiceInputUseCase {
  execute(input: TranscribeVoiceInputDTO): Promise<VoiceTranscriptViewDTO>;
}

export class TranscribeVoiceInputUseCase implements ITranscribeVoiceInputUseCase {
  constructor(
    private readonly _gateway: IVoiceTranscriptionGateway,
    private readonly _mapper: IVoiceInputMapper
  ) {}

  async execute(input: TranscribeVoiceInputDTO) {
    try {
      const transcript = await this._gateway.transcribe({
        audio: input.audio,
        ...(input.language ? { language: input.language } : {}),
      });
      if (!transcript.text) throw VoiceInputApplicationError.emptyTranscript();
      return this._mapper.toView(transcript);
    } catch (error) {
      if (error instanceof VoiceInputApplicationError) throw error;
      throw VoiceInputApplicationError.transcriptionFailed();
    }
  }
}

import type { VoiceTranscriptEntity } from '../domain/entities/voice-transcript.entity';
import type { VoiceTranscriptViewDTO } from './voice-input.dto';

export interface IVoiceInputMapper {
  toView(entity: VoiceTranscriptEntity): VoiceTranscriptViewDTO;
}

export class VoiceInputMapper implements IVoiceInputMapper {
  toView(entity: VoiceTranscriptEntity) {
    return {
      text: entity.text,
      language: entity.language,
    };
  }
}

import type { ErrorKind } from '../../../../shared/errors/error-kind';
import { VoiceInputDomainError } from '../domain/voice-input-domain.error';

export class VoiceInputApplicationError extends VoiceInputDomainError {
  readonly kind: ErrorKind;

  private constructor(kind: ErrorKind, code: string, message: string) {
    super(code, message);
    this.name = 'VoiceInputApplicationError';
    this.kind = kind;
  }

  static transcriptionFailed() {
    return new VoiceInputApplicationError(
      'dependency-failure',
      'VOICE_TRANSCRIPTION_FAILED',
      'Voice input could not be transcribed. Please try again.'
    );
  }

  static emptyTranscript() {
    return new VoiceInputApplicationError(
      'invalid-input',
      'VOICE_TRANSCRIPT_EMPTY',
      'No speech could be detected in that recording'
    );
  }
}

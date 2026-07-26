import { describe, expect, it, vi } from 'vitest';

import { TranscribeVoiceInputUseCase } from '../../src/modules/user/voice-input/application/use-cases/transcribe-voice-input.usecase';
import { VoiceInputMapper } from '../../src/modules/user/voice-input/application/voice-input.mapper';
import { VoiceTranscriptEntity } from '../../src/modules/user/voice-input/domain/entities/voice-transcript.entity';
import type { IVoiceTranscriptionGateway } from '../../src/modules/user/voice-input/domain/gateways/voice-transcription.gateway.interface';

const audio = {
  buffer: Buffer.from('recorded audio'),
  mimeType: 'audio/webm',
  fileName: 'voice.webm',
  sizeBytes: 14,
};

describe('TranscribeVoiceInputUseCase', () => {
  it('returns the normalized server transcript', async () => {
    const transcribe = vi.fn().mockResolvedValue(
      new VoiceTranscriptEntity({
        text: '  Build a revision plan  ',
        language: 'en',
      })
    );
    const gateway: IVoiceTranscriptionGateway = { transcribe };
    const useCase = new TranscribeVoiceInputUseCase(gateway, new VoiceInputMapper());

    await expect(useCase.execute({ audio })).resolves.toEqual({
      text: 'Build a revision plan',
      language: 'en',
    });
    expect(transcribe).toHaveBeenCalledWith({ audio });
  });

  it('maps provider failures to the module application error', async () => {
    const gateway: IVoiceTranscriptionGateway = {
      transcribe: vi.fn().mockRejectedValue(new Error('provider unavailable')),
    };
    const useCase = new TranscribeVoiceInputUseCase(gateway, new VoiceInputMapper());

    await expect(useCase.execute({ audio })).rejects.toMatchObject({
      code: 'VOICE_TRANSCRIPTION_FAILED',
    });
  });
});

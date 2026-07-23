import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../shared/constants/http-status-code.enum';
import { ApiError } from '../../../../shared/utils/api-error';
import { ApiResponse } from '../../../../shared/utils/api-response';
import type { VoiceInputUseCases } from '../application/voice-input-use-cases.contract';
import { transcribeVoiceInputSchema } from './voice-input.schema';

export class VoiceInputController {
  constructor(private readonly _useCases: VoiceInputUseCases) {}

  transcribe = async (request: Request, response: Response, next: NextFunction) => {
    try {
      if (!request.file) {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          'Record some audio before transcribing',
          'VOICE_INPUT_FILE_REQUIRED'
        );
      }
      const parsed = transcribeVoiceInputSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          parsed.error.issues[0]?.message ?? 'Voice input request is invalid',
          'VALIDATION_ERROR'
        );
      }
      const result = await this._useCases.transcribe.execute({
        audio: {
          originalName: request.file.originalname,
          mimeType: request.file.mimetype,
          sizeBytes: request.file.size,
          buffer: request.file.buffer,
        },
        ...(parsed.data.language ? { language: parsed.data.language } : {}),
      });
      response.json(new ApiResponse('Voice input transcribed', result));
    } catch (error) {
      next(error);
    }
  };
}

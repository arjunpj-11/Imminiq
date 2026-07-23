import { Router } from 'express';

import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { authenticatedApiUserLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware';
import type { VoiceInputUseCases } from '../application/voice-input-use-cases.contract';
import { VoiceInputController } from './voice-input.controller';
import { VOICE_INPUT_ROUTE_PATHS } from './voice-input.route.constants';
import { voiceInputUpload } from './voice-input-upload.middleware';

export const createVoiceInputRoutes = (useCases: VoiceInputUseCases) => {
  const router = Router();
  const controller = new VoiceInputController(useCases);

  router.post(
    VOICE_INPUT_ROUTE_PATHS.TRANSCRIPTIONS,
    authenticate,
    authenticatedApiUserLimiter,
    voiceInputUpload.single('audio'),
    controller.transcribe
  );

  return router;
};

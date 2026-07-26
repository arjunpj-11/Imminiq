import { CHAT_MAX_VOICE_DURATION_SECONDS } from '../constants/chat.constants';

export const calculateVoiceDurationSeconds = (elapsedMilliseconds: number) =>
  Math.max(
    1,
    Math.min(CHAT_MAX_VOICE_DURATION_SECONDS, Math.round(Math.max(0, elapsedMilliseconds) / 1_000))
  );

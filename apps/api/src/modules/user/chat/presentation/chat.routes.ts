import { Router } from 'express';

import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { authenticatedApiUserLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware';
import type { ChatUseCases } from '../application/chat-use-cases.contract';
import { ChatController } from './chat.controller';
import { chatFileUpload, validateChatFileSignature } from './chat-upload.middleware';
import { CHAT_ROUTE_PATHS } from './chat.route.constants';

export const createChatRoutes = (useCases: ChatUseCases) => {
  const router = Router();
  const controller = new ChatController(useCases);

  router.use(authenticate, authenticatedApiUserLimiter);
  router.get(CHAT_ROUTE_PATHS.CONVERSATIONS, controller.listConversations);
  router.post(CHAT_ROUTE_PATHS.CONVERSATIONS, controller.createConversation);
  router.get(CHAT_ROUTE_PATHS.MESSAGES, controller.listMessages);
  router.post(
    CHAT_ROUTE_PATHS.MESSAGES,
    chatFileUpload.single('file'),
    validateChatFileSignature,
    controller.sendMessage
  );
  router.patch(CHAT_ROUTE_PATHS.READ, controller.markRead);
  router.post(CHAT_ROUTE_PATHS.FORWARD, controller.forwardMessage);
  router.post(CHAT_ROUTE_PATHS.TRACKER_SHARES, controller.shareTracker);
  router.get(CHAT_ROUTE_PATHS.BLOCKS, controller.listBlockedUsers);
  router.post(CHAT_ROUTE_PATHS.BLOCKS, controller.blockUser);
  router.delete(CHAT_ROUTE_PATHS.BLOCK_BY_USER, controller.unblockUser);

  return router;
};

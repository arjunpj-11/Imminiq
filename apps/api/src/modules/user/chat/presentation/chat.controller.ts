import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../shared/constants/http-status-code.enum';
import { ApiError } from '../../../../shared/utils/api-error';
import { ApiResponse } from '../../../../shared/utils/api-response';
import { getAuthUser } from '../../../../shared/utils/get-auth-user';
import { CHAT_RESPONSE_MESSAGES } from '../application/chat.constants';
import type { ChatUseCases } from '../application/chat-use-cases.contract';
import {
  blockUserSchema,
  conversationParamsSchema,
  createConversationSchema,
  forwardChatMessageSchema,
  listChatSchema,
  messageParamsSchema,
  sendChatMessageSchema,
  shareProfileSchema,
  shareTrackerSchema,
  userBlockParamsSchema,
} from './chat.schema';

export class ChatController {
  constructor(private readonly _useCases: ChatUseCases) {}

  listConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = this.parse(listChatSchema.safeParse(req.query));
      const result = await this._useCases.listConversations.execute(
        getAuthUser(req).userId,
        query
      );
      res.json(new ApiResponse(CHAT_RESPONSE_MESSAGES.CONVERSATIONS_LISTED, result));
    } catch (error) {
      next(error);
    }
  };

  createConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = this.parse(createConversationSchema.safeParse(req.body));
      const result = await this._useCases.startConversation.execute(
        getAuthUser(req).userId,
        input
      );
      res
        .status(result.created ? HttpStatusCode.CREATED : HttpStatusCode.OK)
        .json(
          new ApiResponse(CHAT_RESPONSE_MESSAGES.CONVERSATION_READY, result.conversation)
        );
    } catch (error) {
      next(error);
    }
  };

  listMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = this.parse(conversationParamsSchema.safeParse(req.params));
      const query = this.parse(listChatSchema.safeParse(req.query));
      const result = await this._useCases.listMessages.execute(
        getAuthUser(req).userId,
        params.conversationId,
        query
      );
      res.json(new ApiResponse(CHAT_RESPONSE_MESSAGES.MESSAGES_LISTED, result));
    } catch (error) {
      next(error);
    }
  };

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = this.parse(conversationParamsSchema.safeParse(req.params));
      const body = this.parse(sendChatMessageSchema.safeParse(req.body));
      const result = await this._useCases.sendMessage.execute(getAuthUser(req).userId, {
        conversationId: params.conversationId,
        kind: body.kind,
        ...(body.text !== undefined ? { text: body.text } : {}),
        ...(body.codeLanguage !== undefined ? { codeLanguage: body.codeLanguage } : {}),
        ...(body.durationSeconds !== undefined
          ? { durationSeconds: body.durationSeconds }
          : {}),
        ...(req.file
          ? {
              file: {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                buffer: req.file.buffer,
              },
            }
          : {}),
      });
      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse(CHAT_RESPONSE_MESSAGES.MESSAGE_SENT, result));
    } catch (error) {
      next(error);
    }
  };

  markRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = this.parse(conversationParamsSchema.safeParse(req.params));
      const result = await this._useCases.markConversationRead.execute(
        getAuthUser(req).userId,
        params.conversationId
      );
      res.json(new ApiResponse(CHAT_RESPONSE_MESSAGES.CONVERSATION_READ, result));
    } catch (error) {
      next(error);
    }
  };

  forwardMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = this.parse(messageParamsSchema.safeParse(req.params));
      const body = this.parse(forwardChatMessageSchema.safeParse(req.body));
      const result = await this._useCases.forwardMessage.execute(
        getAuthUser(req).userId,
        {
          messageId: params.messageId,
          targetConversationId: body.targetConversationId,
        }
      );
      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse(CHAT_RESPONSE_MESSAGES.MESSAGE_FORWARDED, result));
    } catch (error) {
      next(error);
    }
  };

  toggleMessageStar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = this.parse(messageParamsSchema.safeParse(req.params));
      const result = await this._useCases.toggleMessageStar.execute(
        getAuthUser(req).userId,
        params.messageId
      );
      res.json(new ApiResponse(CHAT_RESPONSE_MESSAGES.MESSAGE_STAR_UPDATED, result));
    } catch (error) {
      next(error);
    }
  };

  clearConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = this.parse(conversationParamsSchema.safeParse(req.params));
      const result = await this._useCases.clearConversation.execute(
        getAuthUser(req).userId,
        params.conversationId
      );
      res.json(new ApiResponse(CHAT_RESPONSE_MESSAGES.CONVERSATION_CLEARED, result));
    } catch (error) {
      next(error);
    }
  };

  shareTracker = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = this.parse(shareTrackerSchema.safeParse(req.body));
      const result = await this._useCases.shareTracker.execute(
        getAuthUser(req).userId,
        body
      );
      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse(CHAT_RESPONSE_MESSAGES.TRACKER_SHARED, result));
    } catch (error) {
      next(error);
    }
  };

  shareProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = this.parse(shareProfileSchema.safeParse(req.body));
      const result = await this._useCases.shareProfile.execute(
        getAuthUser(req).userId,
        body
      );
      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse(CHAT_RESPONSE_MESSAGES.PROFILE_SHARED, result));
    } catch (error) {
      next(error);
    }
  };

  listBlockedUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.listBlockedUsers.execute(
        getAuthUser(req).userId
      );
      res.json(new ApiResponse(CHAT_RESPONSE_MESSAGES.BLOCKS_LISTED, result));
    } catch (error) {
      next(error);
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = this.parse(blockUserSchema.safeParse(req.body));
      const result = await this._useCases.blockUser.execute(
        getAuthUser(req).userId,
        body
      );
      res.json(new ApiResponse(CHAT_RESPONSE_MESSAGES.USER_BLOCKED, result));
    } catch (error) {
      next(error);
    }
  };

  unblockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = this.parse(userBlockParamsSchema.safeParse(req.params));
      const result = await this._useCases.unblockUser.execute(
        getAuthUser(req).userId,
        params
      );
      res.json(new ApiResponse(CHAT_RESPONSE_MESSAGES.USER_UNBLOCKED, result));
    } catch (error) {
      next(error);
    }
  };

  private parse<T>(
    result:
      | { success: true; data: T }
      | { success: false; error: { issues: Array<{ message: string }> } }
  ): T {
    if (result.success) return result.data;
    throw new ApiError(
      HttpStatusCode.BAD_REQUEST,
      result.error.issues[0]?.message ?? 'Chat request is invalid',
      'VALIDATION_ERROR'
    );
  }
}

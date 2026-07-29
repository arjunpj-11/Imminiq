import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { Readable } from 'node:stream';
import { env } from '../../config/env';
import { Types } from 'mongoose';
import { Tracker } from '../database/models/tracker.model';
import { TrackerClan } from '../database/models/tracker-clan.model';
import { TrackerClanMessage } from '../database/models/tracker-clan-message.model';
import { ChatConversation } from '../database/models/chat-conversation.model';
import { Call } from '../database/models/call.model';
import { User } from '../database/models/user.model';
import { UserBlock } from '../database/models/user-block.model';
import { UserSettings } from '../database/models/user-settings.model';
import type { TrackerClanChallengeEvent } from '../../modules/user/trackers';
import { chatPresenceProvider } from './chat-presence.provider';
import { verifyActiveAccessToken } from '../../shared/middlewares/auth.middleware';
import { cloudinary } from '../storage/cloudinary.client';
import type { FeaturePolicy } from '../../shared/platform-policy';

let io: Server;

const guildRoom = (trackerId: string) => `tracker-clan:${trackerId}`;
const userRoom = (userId: string) => `user:${userId}`;

type ChatPresenceEvent = {
  userId: string;
  isOnline: boolean;
  lastActiveAt: Date | null;
  presenceVisible: boolean;
};

const canShareChatPresence = async (userId: string) => {
  const settings = await UserSettings.findOne({ userId })
    .select('privacy.showOnlineStatus')
    .lean<{ privacy?: { showOnlineStatus?: boolean } } | null>();
  return settings?.privacy?.showOnlineStatus ?? true;
};

const publishChatPresence = async (event: ChatPresenceEvent) => {
  const [conversations, blocks] = await Promise.all([
    ChatConversation.find({
      participantIds: event.userId,
      deletedAt: null,
    })
      .select('participantIds')
      .lean<Array<{ participantIds: Types.ObjectId[] }>>(),
    UserBlock.find({
      $or: [{ blockerUserId: event.userId }, { blockedUserId: event.userId }],
      deletedAt: null,
    })
      .select('blockerUserId blockedUserId')
      .lean<
        Array<{
          blockerUserId: Types.ObjectId;
          blockedUserId: Types.ObjectId;
        }>
      >(),
  ]);
  const blockedParticipantIds = new Set(
    blocks.map((block) =>
      String(block.blockerUserId) === event.userId
        ? String(block.blockedUserId)
        : String(block.blockerUserId)
    )
  );
  const recipientIds = new Set(
    conversations.flatMap((conversation) =>
      conversation.participantIds
        .map(String)
        .filter(
          (participantId) =>
            participantId !== event.userId && !blockedParticipantIds.has(participantId)
        )
    )
  );
  for (const recipientId of recipientIds) {
    io.to(userRoom(recipientId)).emit('chat:presence', event);
  }
};

const refreshChatPresence = async (userId: string, isOnline: boolean) => {
  const lastActiveAt = new Date();
  const presenceVisible = await canShareChatPresence(userId);
  await User.updateOne({ _id: userId, deletedAt: null }, { $set: { lastActiveAt } });
  await publishChatPresence({
    userId,
    isOnline: presenceVisible && isOnline,
    lastActiveAt: presenceVisible ? lastActiveAt : null,
    presenceVisible,
  });
};

const safelyRefreshChatPresence = (userId: string, isOnline: boolean) =>
  refreshChatPresence(userId, isOnline).catch(() => undefined);

const getGuildRole = async (trackerId: string, userId: string) => {
  if (!Types.ObjectId.isValid(trackerId) || !Types.ObjectId.isValid(userId)) return null;
  const tracker = await Tracker.findOne({ _id: trackerId, deletedAt: null })
    .select('ownerId visibility publishedAt')
    .lean();
  if (!tracker) return null;
  if (String(tracker.ownerId) === userId) return 'owner';
  const clan = await TrackerClan.findOne({ trackerId, 'members.userId': userId })
    .select('members')
    .lean<{ members?: Array<{ userId: unknown; role: 'co_owner' | 'member' }> }>();
  return clan?.members?.find((member) => String(member.userId) === userId)?.role ?? null;
};

const uploadGuildFile = (
  file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  userId: string
) =>
  new Promise<{
    url: string;
    storagePublicId?: string;
    name: string;
    mimeType: string;
    sizeBytes: number;
  }>((resolve, reject) => {
    const resourceType = file.mimetype.startsWith('image/')
      ? 'image'
      : file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')
        ? 'video'
        : 'raw';
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `imminiq/guild-chat/${userId}`,
        resource_type: resourceType,
        overwrite: false,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error('Guild attachment upload failed'));
          return;
        }
        resolve({
          url: result.secure_url,
          ...(result.public_id ? { storagePublicId: result.public_id } : {}),
          name: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
        });
      }
    );
    stream.on('error', reject);
    Readable.from(file.buffer).pipe(stream);
  });

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
    path: '/api/socket.io',
    serveClient: false,
    maxHttpBufferSize: 11 * 1024 * 1024,
    perMessageDeflate: false,
  });

  io.use(async (socket, next) => {
    const token =
      typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : '';

    try {
      const payload = await verifyActiveAccessToken(token);

      socket.data.user = {
        userId: payload.userId,
        role: payload.role,
      };
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = String(socket.data.user?.userId ?? '');
    let lastMessageAt = 0;

    if (userId) {
      void socket.join(userRoom(userId));
      const becameOnline = chatPresenceProvider.connect(userId, socket.id);
      if (becameOnline) void safelyRefreshChatPresence(userId, true);
    }

    socket.on(
      'chat:presence:refresh',
      async (_payload: unknown, acknowledge?: (result: unknown) => void) => {
        try {
          await refreshChatPresence(userId, chatPresenceProvider.isOnline(userId));
          acknowledge?.({ ok: true });
        } catch {
          acknowledge?.({ ok: false });
        }
      }
    );

    socket.on(
      'tracker-clan:join',
      async (payload: { trackerId?: string }, acknowledge?: (result: unknown) => void) => {
        try {
          const trackerId = String(payload?.trackerId ?? '');
          const role = await getGuildRole(trackerId, userId);
          if (!role) {
            acknowledge?.({ ok: false, message: 'Join this guild before entering its chat.' });
            return;
          }
          await socket.join(guildRoom(trackerId));
          acknowledge?.({ ok: true, role });
        } catch {
          acknowledge?.({ ok: false, message: 'Unable to enter guild chat.' });
        }
      }
    );

    socket.on('tracker-clan:leave', async (payload: { trackerId?: string }) => {
      const trackerId = String(payload?.trackerId ?? '');
      if (trackerId) await socket.leave(guildRoom(trackerId));
    });

    socket.on(
      'chat:typing',
      async (
        payload: { conversationId?: string; isTyping?: boolean },
        acknowledge?: (result: unknown) => void
      ) => {
        try {
          const conversationId = String(payload?.conversationId ?? '');
          if (!Types.ObjectId.isValid(conversationId)) {
            acknowledge?.({ ok: false });
            return;
          }
          const conversation = await ChatConversation.findOne({
            _id: conversationId,
            participantIds: userId,
            deletedAt: null,
          })
            .select('participantIds')
            .lean<{ participantIds: Types.ObjectId[] } | null>();
          const recipientId = conversation?.participantIds
            .map(String)
            .find((participantId) => participantId !== userId);
          if (!recipientId) {
            acknowledge?.({ ok: false });
            return;
          }
          const blocked = await UserBlock.exists({
            $or: [
              { blockerUserId: userId, blockedUserId: recipientId },
              { blockerUserId: recipientId, blockedUserId: userId },
            ],
            deletedAt: null,
          });
          if (blocked) {
            acknowledge?.({ ok: false });
            return;
          }
          io.to(userRoom(recipientId)).emit('chat:typing', {
            conversationId,
            userId,
            isTyping: Boolean(payload?.isTyping),
          });
          acknowledge?.({ ok: true });
        } catch {
          acknowledge?.({ ok: false });
        }
      }
    );

    socket.on(
      'call:signal',
      async (
        payload: {
          callId?: string;
          signal?: { type?: string; [key: string]: unknown };
        },
        acknowledge?: (result: unknown) => void
      ) => {
        try {
          const callId = String(payload?.callId ?? '');
          const signal = payload?.signal;
          if (
            !Types.ObjectId.isValid(callId) ||
            !signal ||
            !['offer', 'answer', 'ice-candidate'].includes(String(signal.type)) ||
            JSON.stringify(signal).length > 14_000
          ) {
            acknowledge?.({ ok: false });
            return;
          }
          const call = await Call.findOne({
            _id: callId,
            participantIds: userId,
            status: 'accepted',
            deletedAt: null,
          })
            .select('callerId calleeId')
            .lean<{ callerId: Types.ObjectId; calleeId: Types.ObjectId } | null>();
          if (!call) {
            acknowledge?.({ ok: false });
            return;
          }
          const recipientId =
            String(call.callerId) === userId ? String(call.calleeId) : String(call.callerId);
          const blocked = await UserBlock.exists({
            $or: [
              { blockerUserId: userId, blockedUserId: recipientId },
              { blockerUserId: recipientId, blockedUserId: userId },
            ],
            deletedAt: null,
          });
          if (blocked) {
            acknowledge?.({ ok: false });
            return;
          }
          io.to(userRoom(recipientId)).emit('call:signal', {
            callId,
            fromUserId: userId,
            signal,
          });
          acknowledge?.({ ok: true });
        } catch {
          acknowledge?.({ ok: false });
        }
      }
    );

    socket.on(
      'tracker-clan:message',
      async (
        payload: {
          trackerId?: string;
          text?: string;
          kind?: 'text' | 'image' | 'file' | 'voice';
          file?: {
            name?: string;
            mimeType?: string;
            size?: number;
            data?: Buffer | { type?: string; data?: number[] };
          };
          durationSeconds?: number;
          replyToMessageId?: string;
        },
        acknowledge?: (result: unknown) => void
      ) => {
        try {
          const trackerId = String(payload?.trackerId ?? '');
          const text = String(payload?.text ?? '').trim();
          const incomingFile = payload?.file;
          if ((!text && !incomingFile) || text.length > 1000) {
            acknowledge?.({ ok: false, message: 'Add a message or attachment before sending.' });
            return;
          }
          if (Date.now() - lastMessageAt < 500) {
            acknowledge?.({ ok: false, message: 'Please wait before sending another message.' });
            return;
          }
          const role = await getGuildRole(trackerId, userId);
          if (!role) {
            acknowledge?.({ ok: false, message: 'You are not a member of this guild.' });
            return;
          }
          let attachment:
            | {
                url: string;
                storagePublicId?: string;
                name: string;
                mimeType: string;
                sizeBytes: number;
                durationSeconds: number | null;
              }
            | undefined;
          if (incomingFile) {
            const mimeType = String(incomingFile.mimeType ?? '').toLowerCase();
            const dataValue = incomingFile.data;
            const buffer = Buffer.isBuffer(dataValue)
              ? dataValue
              : Array.isArray(dataValue?.data)
                ? Buffer.from(dataValue.data)
                : null;
            const allowed = new Set([
              'image/jpeg',
              'image/png',
              'image/webp',
              'audio/webm',
              'audio/ogg',
              'audio/mpeg',
              'audio/mp4',
              'audio/wav',
              'audio/x-wav',
              'video/mp4',
              'video/webm',
              'video/quicktime',
              'application/pdf',
              'text/plain',
              'text/csv',
              'application/zip',
            ]).has(mimeType);
            if (!buffer || !allowed || buffer.length === 0 || buffer.length > 10 * 1024 * 1024) {
              acknowledge?.({ ok: false, message: 'Choose a supported file up to 10 MB.' });
              return;
            }
            const uploaded = await uploadGuildFile(
              {
                buffer,
                originalname:
                  String(incomingFile.name ?? 'attachment')
                    .replace(/[^a-zA-Z0-9._ -]/g, '_')
                    .replace(/\s+/g, ' ')
                    .slice(0, 180) || 'attachment',
                mimetype: mimeType,
                size: buffer.length,
              },
              userId
            );
            attachment = {
              ...uploaded,
              durationSeconds: payload.durationSeconds
                ? Math.max(1, Math.min(300, payload.durationSeconds))
                : null,
            };
          }
          const kind = attachment
            ? payload.kind === 'voice' && attachment.mimeType.startsWith('audio/')
              ? 'voice'
              : attachment.mimeType.startsWith('image/')
                ? 'image'
                : 'file'
            : 'text';
          const replyToMessageId = String(payload.replyToMessageId ?? '');
          const replySource = replyToMessageId
            ? await TrackerClanMessage.findOne({
                _id: Types.ObjectId.isValid(replyToMessageId) ? replyToMessageId : null,
                trackerId,
                deletedAt: null,
              })
                .select('userId text kind')
                .lean<{
                  _id: Types.ObjectId;
                  userId: Types.ObjectId;
                  text?: string;
                  kind?: 'text' | 'image' | 'file' | 'voice';
                } | null>()
            : null;
          if (replyToMessageId && !replySource) {
            acknowledge?.({ ok: false, message: 'The message you replied to is unavailable.' });
            return;
          }
          const replyTo = replySource
            ? {
                messageId: replySource._id,
                senderId: replySource.userId,
                text: replySource.text ?? '',
                kind: replySource.kind ?? 'text',
              }
            : null;
          const [created, user] = await Promise.all([
            TrackerClanMessage.create({
              trackerId,
              userId,
              text,
              kind,
              ...(attachment ? { attachment } : {}),
              replyTo,
              reactions: [],
              deletedAt: null,
            }),
            User.findById(userId).select('fullName username avatarUrl').lean(),
          ]);
          lastMessageAt = Date.now();
          const username = user?.username ?? `user-${userId.slice(-6)}`;
          const message = {
            id: created._id.toString(),
            trackerId,
            text: created.text,
            kind,
            ...(attachment ? { attachment } : {}),
            replyTo: replyTo
              ? {
                  messageId: String(replyTo.messageId),
                  senderId: String(replyTo.senderId),
                  text: replyTo.text,
                  kind: replyTo.kind,
                }
              : null,
            reactions: [],
            createdAt: created.createdAt,
            user: {
              userId,
              name: user?.fullName?.trim() || username,
              username,
              avatarUrl: user?.avatarUrl ?? null,
            },
          };
          io.to(guildRoom(trackerId)).emit('tracker-clan:message', message);
          acknowledge?.({ ok: true, message });
        } catch {
          acknowledge?.({ ok: false, message: 'Unable to send message.' });
        }
      }
    );

    socket.on(
      'tracker-clan:reaction',
      async (
        payload: { trackerId?: string; messageId?: string; emoji?: string },
        acknowledge?: (result: unknown) => void
      ) => {
        try {
          const trackerId = String(payload?.trackerId ?? '');
          const messageId = String(payload?.messageId ?? '');
          const emoji = String(payload?.emoji ?? '');
          const allowedEmoji = new Set(['👍', '❤️', '😂', '🎉', '🤔', '👏']);
          if (!Types.ObjectId.isValid(messageId) || !allowedEmoji.has(emoji)) {
            acknowledge?.({ ok: false, message: 'Choose a supported reaction.' });
            return;
          }
          if (!(await getGuildRole(trackerId, userId))) {
            acknowledge?.({ ok: false, message: 'You are not a member of this guild.' });
            return;
          }
          const current = await TrackerClanMessage.findOne({
            _id: messageId,
            trackerId,
            deletedAt: null,
          }).lean<{
            reactions?: Array<{ emoji: string; userIds: Types.ObjectId[] }>;
          } | null>();
          if (!current) {
            acknowledge?.({ ok: false, message: 'This message is unavailable.' });
            return;
          }
          const viewerObjectId = new Types.ObjectId(userId);
          const previouslySelected = (current.reactions ?? []).some(
            (reaction) =>
              reaction.emoji === emoji &&
              reaction.userIds.some((reactionUserId) => String(reactionUserId) === userId)
          );
          const reactions = (current.reactions ?? [])
            .map((reaction) => ({
              emoji: reaction.emoji,
              userIds: reaction.userIds.filter(
                (reactionUserId) => String(reactionUserId) !== userId
              ),
            }))
            .filter((reaction) => reaction.userIds.length > 0);
          if (!previouslySelected) {
            const existing = reactions.find((reaction) => reaction.emoji === emoji);
            if (existing) existing.userIds.push(viewerObjectId);
            else reactions.push({ emoji, userIds: [viewerObjectId] });
          }
          const updated = await TrackerClanMessage.findByIdAndUpdate(
            messageId,
            { $set: { reactions } },
            { returnDocument: 'after' }
          )
            .populate('userId', 'fullName username avatarUrl')
            .lean<{
              _id: Types.ObjectId;
              trackerId: Types.ObjectId;
              text: string;
              kind?: 'text' | 'image' | 'file' | 'voice';
              attachment?: Record<string, unknown>;
              replyTo?: {
                messageId: Types.ObjectId;
                senderId: Types.ObjectId;
                text?: string;
                kind: 'text' | 'image' | 'file' | 'voice';
              } | null;
              reactions?: Array<{ emoji: string; userIds: Types.ObjectId[] }>;
              createdAt: Date;
              userId: {
                _id: Types.ObjectId;
                fullName?: string;
                username?: string;
                avatarUrl?: string | null;
              };
            } | null>();
          if (!updated) {
            acknowledge?.({ ok: false, message: 'This message is unavailable.' });
            return;
          }
          const username =
            updated.userId.username ?? `user-${String(updated.userId._id).slice(-6)}`;
          const message = {
            id: String(updated._id),
            trackerId: String(updated.trackerId),
            text: updated.text,
            kind: updated.kind ?? 'text',
            ...(updated.attachment?.url ? { attachment: updated.attachment } : {}),
            replyTo: updated.replyTo
              ? {
                  messageId: String(updated.replyTo.messageId),
                  senderId: String(updated.replyTo.senderId),
                  text: updated.replyTo.text ?? '',
                  kind: updated.replyTo.kind,
                }
              : null,
            reactions: (updated.reactions ?? []).map((reaction) => ({
              emoji: reaction.emoji,
              count: reaction.userIds.length,
              userIds: reaction.userIds.map(String),
            })),
            createdAt: updated.createdAt,
            user: {
              userId: String(updated.userId._id),
              name: updated.userId.fullName?.trim() || username,
              username,
              avatarUrl: updated.userId.avatarUrl ?? null,
            },
          };
          io.to(guildRoom(trackerId)).emit('tracker-clan:message', message);
          acknowledge?.({ ok: true });
        } catch {
          acknowledge?.({ ok: false, message: 'Unable to update reaction.' });
        }
      }
    );

    socket.on(
      'tracker-clan:delete-message',
      async (
        payload: { trackerId?: string; messageId?: string },
        acknowledge?: (result: unknown) => void
      ) => {
        try {
          const trackerId = String(payload?.trackerId ?? '');
          const messageId = String(payload?.messageId ?? '');
          if (!Types.ObjectId.isValid(messageId) || !(await getGuildRole(trackerId, userId))) {
            acknowledge?.({ ok: false, message: 'This message is unavailable.' });
            return;
          }
          const deleted = await TrackerClanMessage.findOneAndUpdate(
            {
              _id: messageId,
              trackerId,
              userId,
              deletedAt: null,
            },
            { $set: { deletedAt: new Date() } },
            { returnDocument: 'after' }
          ).select('_id');
          if (!deleted) {
            acknowledge?.({ ok: false, message: 'You can only delete your own messages.' });
            return;
          }
          io.to(guildRoom(trackerId)).emit('tracker-clan:message-deleted', {
            trackerId,
            messageId,
          });
          acknowledge?.({ ok: true });
        } catch {
          acknowledge?.({ ok: false, message: 'Unable to delete message.' });
        }
      }
    );

    socket.on('disconnect', () => {
      if (!userId) return;
      const becameOffline = chatPresenceProvider.disconnect(userId, socket.id);
      if (becameOffline) void safelyRefreshChatPresence(userId, false);
    });
  });

  console.log('✅ Socket.io ready');
  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export const emitTrackerClanChallenge = (event: TrackerClanChallengeEvent) => {
  if (!io) return;
  io.to(guildRoom(event.trackerId)).emit('tracker-clan:challenge', event);
};

export const emitNotificationCreated = (userId: string, type: string) => {
  if (!io || !userId) return;
  io.to(userRoom(userId)).emit('notification:created', { type });
};

export const emitFeatureAvailabilityChanged = (features: FeaturePolicy) => {
  if (!io) return;
  io.emit('feature-availability:changed', features);
};

export const emitChatMessageCreated = (userIds: string[], message: unknown) => {
  if (!io) return;
  for (const userId of userIds) {
    io.to(userRoom(userId)).emit('chat:message', message);
  }
};

export const emitChatConversationRead = (userIds: string[], event: unknown) => {
  if (!io) return;
  for (const userId of userIds) {
    io.to(userRoom(userId)).emit('chat:read', event);
  }
};

export const emitChatBlockStateChanged = (userIds: string[], event: unknown) => {
  if (!io) return;
  for (const userId of userIds) {
    io.to(userRoom(userId)).emit('chat:block-updated', event);
  }
};

export const emitCallIncoming = (userId: string, call: unknown) => {
  if (!io || !userId) return;
  io.to(userRoom(userId)).emit('call:incoming', call);
};

export const emitCallUpdated = (userId: string, call: unknown) => {
  if (!io || !userId) return;
  io.to(userRoom(userId)).emit('call:updated', call);
};

export const disconnectUserSockets = (userId: string) => {
  if (!io || !userId) return;
  io.in(userRoom(userId)).disconnectSockets(true);
};

export const closeSocket = async () => {
  if (!io) return;
  await new Promise<void>((resolve) => io.close(() => resolve()));
};

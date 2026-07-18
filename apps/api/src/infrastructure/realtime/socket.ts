import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from '../../config/env';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { Tracker } from '../database/models/tracker.model';
import { TrackerClan } from '../database/models/tracker-clan.model';
import { TrackerClanMessage } from '../database/models/tracker-clan-message.model';
import { User } from '../database/models/user.model';
import type { TrackerClanChallengeEvent } from '../../modules/user/trackers';

type SocketAccessToken = {
  userId: string;
  role: 'user' | 'admin' | 'moderator' | 'superadmin';
  type: 'access';
};

let io: Server;

const guildRoom = (trackerId: string) => `tracker-clan:${trackerId}`;
const userRoom = (userId: string) => `user:${userId}`;

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

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
    path: '/api/socket.io',
    serveClient: false,
    maxHttpBufferSize: 16 * 1024,
    perMessageDeflate: false,
  });

  io.use((socket, next) => {
    const token =
      typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : '';

    try {
      const payload = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'imminiq-api',
        audience: 'imminiq-web',
      }) as Partial<SocketAccessToken>;

      if (
        payload.type !== 'access' ||
        typeof payload.userId !== 'string' ||
        !['user', 'admin', 'moderator', 'superadmin'].includes(payload.role ?? '')
      ) {
        throw new Error('Invalid socket token');
      }

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

    if (userId) void socket.join(userRoom(userId));

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
      'tracker-clan:message',
      async (
        payload: { trackerId?: string; text?: string },
        acknowledge?: (result: unknown) => void
      ) => {
        try {
          const trackerId = String(payload?.trackerId ?? '');
          const text = String(payload?.text ?? '').trim();
          if (!text || text.length > 1000) {
            acknowledge?.({ ok: false, message: 'Message must be 1–1000 characters.' });
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
          const [created, user] = await Promise.all([
            TrackerClanMessage.create({ trackerId, userId, text, deletedAt: null }),
            User.findById(userId).select('fullName username avatarUrl').lean(),
          ]);
          lastMessageAt = Date.now();
          const username = user?.username ?? `user-${userId.slice(-6)}`;
          const message = {
            id: created._id.toString(),
            trackerId,
            text: created.text,
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

export const closeSocket = async () => {
  if (!io) return;
  await new Promise<void>((resolve) => io.close(() => resolve()));
};

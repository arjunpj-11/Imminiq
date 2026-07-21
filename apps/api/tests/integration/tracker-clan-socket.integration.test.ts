import http from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { io as createClient, type Socket } from 'socket.io-client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { env } from '../../src/config/env';
import { AuthToken } from '../../src/infrastructure/database/models/auth-token.model';
import { Tracker } from '../../src/infrastructure/database/models/tracker.model';
import { TrackerClan } from '../../src/infrastructure/database/models/tracker-clan.model';
import { TrackerClanMessage } from '../../src/infrastructure/database/models/tracker-clan-message.model';
import { Notification } from '../../src/infrastructure/database/models/notification.model';
import { User } from '../../src/infrastructure/database/models/user.model';
import {
  closeSocket,
  emitTrackerClanChallenge,
  initSocket,
} from '../../src/infrastructure/realtime/socket';

describe('tracker guild Socket.IO chat', () => {
  let mongo: MongoMemoryServer;
  let client: Socket | null = null;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  afterAll(async () => {
    client?.disconnect();
    await closeSocket();
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('authenticates a guild member, joins the room, persists, and broadcasts a message', async () => {
    const [owner, member] = await User.create([
      { fullName: 'Socket Owner', username: 'socket-owner', passwordHash: null, emailVerified: true },
      { fullName: 'Socket Member', username: 'socket-member', passwordHash: null, emailVerified: true },
    ]);
    const tracker = await Tracker.create({
      ownerId: owner._id,
      title: 'Realtime Guild',
      slug: 'realtime-guild',
      visibility: 'public',
      publishedAt: new Date(),
      status: 'active',
    });
    await TrackerClan.create({
      trackerId: tracker._id,
      members: [{ userId: member._id, role: 'member', joinedAt: new Date() }],
    });

    const server = http.createServer();
    initSocket(server);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Expected TCP server address');
    const session = await AuthToken.create({
      userId: member._id,
      refreshTokenHash: 'socket-test-refresh-token-hash',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    const token = jwt.sign(
      {
        userId: member._id.toString(),
        role: 'user',
        type: 'access',
        sessionId: session._id.toString(),
      },
      env.JWT_SECRET,
      { algorithm: 'HS256', issuer: 'imminiq-api', audience: 'imminiq-web', expiresIn: '5m' }
    );
    client = createClient(`http://127.0.0.1:${address.port}`, {
      auth: { token },
      path: '/api/socket.io',
      transports: ['websocket'],
    });
    await new Promise<void>((resolve, reject) => {
      client!.once('connect', resolve);
      client!.once('connect_error', reject);
    });

    const joined = await new Promise<{ ok: boolean; role?: string }>((resolve) =>
      client!.emit('tracker-clan:join', { trackerId: tracker._id.toString() }, resolve)
    );
    expect(joined).toEqual({ ok: true, role: 'member' });
    const challengeEvent = new Promise<Record<string, unknown>>((resolve) =>
      client!.once('tracker-clan:challenge', resolve)
    );
    emitTrackerClanChallenge({
      id: new mongoose.Types.ObjectId().toString(),
      trackerId: tracker._id.toString(),
      status: 'active',
      challengerId: owner._id.toString(),
      opponentId: member._id.toString(),
    });
    await expect(challengeEvent).resolves.toEqual({
      id: expect.any(String),
      trackerId: tracker._id.toString(),
      status: 'active',
      challengerId: owner._id.toString(),
      opponentId: member._id.toString(),
    });
    const notificationEvent = new Promise<{ type: string }>((resolve) =>
      client!.once('notification:created', resolve)
    );
    await Notification.create({
      userId: member._id,
      type: 'tracker_clan_challenge_received',
      message: 'You received a direct challenge.',
    });
    await expect(notificationEvent).resolves.toEqual({
      type: 'tracker_clan_challenge_received',
    });
    const broadcast = new Promise<{ text: string; user: { username: string } }>((resolve) =>
      client!.once('tracker-clan:message', resolve)
    );
    const acknowledged = await new Promise<{ ok: boolean }>((resolve) =>
      client!.emit(
        'tracker-clan:message',
        { trackerId: tracker._id.toString(), text: 'Realtime hello' },
        resolve
      )
    );
    expect(acknowledged.ok).toBe(true);
    await expect(broadcast).resolves.toMatchObject({
      text: 'Realtime hello',
      user: { username: 'socket-member' },
    });
    await expect(
      TrackerClanMessage.countDocuments({ trackerId: tracker._id, text: 'Realtime hello' })
    ).resolves.toBe(1);
  });
});

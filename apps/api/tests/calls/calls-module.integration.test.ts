import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { Call } from '../../src/infrastructure/database/models/call.model';
import { Friend } from '../../src/infrastructure/database/models/friend.model';
import { User } from '../../src/infrastructure/database/models/user.model';
import { UserBlock } from '../../src/infrastructure/database/models/user-block.model';
import { createCallsComposition } from '../../src/modules/user/calls';

describe('calls module', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await Promise.all([Call.init(), Friend.init(), User.init(), UserBlock.init()]);
  });

  beforeEach(async () => {
    await Promise.all([
      Call.deleteMany({}),
      Friend.deleteMany({}),
      User.deleteMany({}),
      UserBlock.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  const createUser = (fullName: string, username: string) =>
    User.create({ fullName, username, passwordHash: null });

  const connectFriends = (firstUserId: string, secondUserId: string) =>
    Friend.create([
      {
        userId: firstUserId,
        friendId: secondUserId,
        status: 'active',
        deletedAt: null,
      },
      {
        userId: secondUserId,
        friendId: firstUserId,
        status: 'active',
        deletedAt: null,
      },
    ]);

  it('delivers the call reason and records declined calls in both histories', async () => {
    const [alice, bob] = await Promise.all([
      createUser('Alice Learner', 'alice'),
      createUser('Bob Learner', 'bob'),
    ]);
    await connectFriends(alice.id, bob.id);
    const { useCases } = createCallsComposition();

    const outgoing = await useCases.initiateCall.execute(alice.id, {
      calleeUserId: bob.id,
      type: 'video',
      reason: 'Please review the lesson with me',
    });

    expect(outgoing).toMatchObject({
      direction: 'outgoing',
      type: 'video',
      reason: 'Please review the lesson with me',
      status: 'ringing',
    });

    const incoming = await useCases.getActiveCall.execute(bob.id);
    expect(incoming).toMatchObject({
      id: outgoing.id,
      direction: 'incoming',
      reason: 'Please review the lesson with me',
      status: 'ringing',
    });

    const declined = await useCases.respondCall.execute(bob.id, outgoing.id, {
      response: 'decline',
    });
    expect(declined.status).toBe('declined');
    await expect(useCases.getActiveCall.execute(alice.id)).resolves.toBeNull();

    const [aliceHistory, bobHistory] = await Promise.all([
      useCases.listCalls.execute(alice.id, { page: 1, limit: 20 }),
      useCases.listCalls.execute(bob.id, { page: 1, limit: 20 }),
    ]);
    expect(aliceHistory.items[0]).toMatchObject({
      id: outgoing.id,
      direction: 'outgoing',
      status: 'declined',
    });
    expect(bobHistory.items[0]).toMatchObject({
      id: outgoing.id,
      direction: 'incoming',
      status: 'declined',
    });
  });

  it('accepts and ends an audio call while preventing another active call', async () => {
    const [alice, bob, charlie] = await Promise.all([
      createUser('Alice Learner', 'alice'),
      createUser('Bob Learner', 'bob'),
      createUser('Charlie Learner', 'charlie'),
    ]);
    await Promise.all([connectFriends(alice.id, bob.id), connectFriends(alice.id, charlie.id)]);
    const { useCases } = createCallsComposition();

    const call = await useCases.initiateCall.execute(alice.id, {
      calleeUserId: bob.id,
      type: 'audio',
      reason: 'Quick progress check',
    });

    await expect(
      useCases.initiateCall.execute(charlie.id, {
        calleeUserId: alice.id,
        type: 'audio',
        reason: 'Can we study now?',
      })
    ).rejects.toMatchObject({ code: 'CALL_USER_BUSY' });

    const accepted = await useCases.respondCall.execute(bob.id, call.id, {
      response: 'accept',
    });
    expect(accepted.status).toBe('accepted');
    expect(accepted.acceptedAt).toBeInstanceOf(Date);
    await Call.updateOne({ _id: call.id }, { $set: { acceptedAt: new Date(Date.now() - 65_000) } });

    const ended = await useCases.endCall.execute(alice.id, call.id, {
      outcome: 'ended',
    });
    expect(ended.status).toBe('ended');
    expect(ended.endedAt).toBeInstanceOf(Date);
    expect(ended.durationSeconds).toBeGreaterThanOrEqual(64);

    await User.updateOne(
      { _id: bob._id },
      { $set: { avatarUrl: 'https://cdn.example/bob-avatar.jpg' } }
    );
    await UserBlock.create({
      blockerUserId: bob._id,
      blockedUserId: alice._id,
      deletedAt: null,
    });
    const historyAfterBlock = await useCases.listCalls.execute(alice.id, {
      page: 1,
      limit: 20,
    });
    expect(historyAfterBlock.items[0]?.otherParticipant.avatarUrl).toBeNull();
  });

  it('allows calls only between active friends', async () => {
    const [alice, stranger] = await Promise.all([
      createUser('Alice Learner', 'alice'),
      createUser('Other Learner', 'other'),
    ]);
    const { useCases } = createCallsComposition();

    await expect(
      useCases.initiateCall.execute(alice.id, {
        calleeUserId: stranger.id,
        type: 'audio',
        reason: 'Can we speak?',
      })
    ).rejects.toMatchObject({ code: 'CALL_NOT_FRIENDS' });
  });

  it('marks an unanswered ringing call as not taken in history', async () => {
    const [alice, bob] = await Promise.all([
      createUser('Alice Learner', 'alice'),
      createUser('Bob Learner', 'bob'),
    ]);
    await connectFriends(alice.id, bob.id);
    const { useCases } = createCallsComposition();
    const call = await useCases.initiateCall.execute(alice.id, {
      calleeUserId: bob.id,
      type: 'audio',
      reason: 'Are you available to review?',
    });

    await Call.updateOne({ _id: call.id }, { $set: { expiresAt: new Date(0) } });

    await expect(useCases.getActiveCall.execute(bob.id)).resolves.toBeNull();
    const history = await useCases.listCalls.execute(bob.id, { page: 1, limit: 20 });
    expect(history.items[0]).toMatchObject({
      id: call.id,
      direction: 'incoming',
      status: 'missed',
    });
  });

  it('prevents audio and video calls when either friend has blocked the other', async () => {
    const [alice, bob] = await Promise.all([
      createUser('Alice Learner', 'alice'),
      createUser('Bob Learner', 'bob'),
    ]);
    await connectFriends(alice.id, bob.id);
    await UserBlock.create({
      blockerUserId: bob._id,
      blockedUserId: alice._id,
      deletedAt: null,
    });
    const { useCases } = createCallsComposition();

    await expect(
      useCases.initiateCall.execute(alice.id, {
        calleeUserId: bob.id,
        type: 'video',
        reason: 'Can you review this lesson?',
      })
    ).rejects.toMatchObject({ code: 'CALL_NOT_FRIENDS' });
  });
});

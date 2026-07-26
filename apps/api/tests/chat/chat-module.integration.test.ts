import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ChatConversation } from '../../src/infrastructure/database/models/chat-conversation.model';
import { ChatMessage } from '../../src/infrastructure/database/models/chat-message.model';
import { Friend } from '../../src/infrastructure/database/models/friend.model';
import { Tracker } from '../../src/infrastructure/database/models/tracker.model';
import { User } from '../../src/infrastructure/database/models/user.model';
import { UserBlock } from '../../src/infrastructure/database/models/user-block.model';
import { UserSettings } from '../../src/infrastructure/database/models/user-settings.model';
import { UserProfile } from '../../src/infrastructure/database/models/user-profile.model';
import { chatPresenceProvider } from '../../src/infrastructure/realtime/chat-presence.provider';
import { createChatComposition } from '../../src/modules/user/chat';

describe('chat module', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await Promise.all([
      ChatConversation.init(),
      ChatMessage.init(),
      Friend.init(),
      Tracker.init(),
      User.init(),
      UserBlock.init(),
      UserSettings.init(),
      UserProfile.init(),
    ]);
  });

  beforeEach(async () => {
    await Promise.all([
      ChatConversation.deleteMany({}),
      ChatMessage.deleteMany({}),
      Friend.deleteMany({}),
      Tracker.deleteMany({}),
      User.deleteMany({}),
      UserBlock.deleteMany({}),
      UserSettings.deleteMany({}),
      UserProfile.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  const createUser = (fullName: string, username: string) =>
    User.create({ fullName, username, passwordHash: null });

  it('starts one friend conversation and sends, lists, and reads messages', async () => {
    const [alice, bob] = await Promise.all([
      createUser('Alice Learner', 'alice'),
      createUser('Bob Learner', 'bob'),
    ]);
    await Friend.create({
      userId: alice._id,
      friendId: bob._id,
      status: 'active',
      deletedAt: null,
    });

    const { useCases } = createChatComposition();
    const first = await useCases.startConversation.execute(alice.id, {
      friendUserId: bob.id,
    });
    const second = await useCases.startConversation.execute(alice.id, {
      friendUserId: bob.id,
    });

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.conversation.id).toBe(first.conversation.id);
    expect(await ChatConversation.countDocuments()).toBe(1);

    const sent = await useCases.sendMessage.execute(alice.id, {
      conversationId: first.conversation.id,
      kind: 'text',
      text: 'Ready to study?',
    });
    expect(sent.text).toBe('Ready to study?');

    const conversations = await useCases.listConversations.execute(bob.id, {
      page: 1,
      limit: 30,
    });
    expect(conversations.items).toHaveLength(1);
    expect(conversations.items[0]?.unreadCount).toBe(1);
    expect(conversations.items[0]?.lastMessage?.text).toBe('Ready to study?');

    const messages = await useCases.listMessages.execute(
      bob.id,
      first.conversation.id,
      { page: 1, limit: 30 }
    );
    expect(messages.items.map((message) => message.text)).toEqual(['Ready to study?']);

    const read = await useCases.markConversationRead.execute(
      bob.id,
      first.conversation.id
    );
    expect(read.updatedCount).toBe(1);

    const refreshed = await useCases.listConversations.execute(bob.id, {
      page: 1,
      limit: 30,
    });
    expect(refreshed.items[0]?.unreadCount).toBe(0);
  });

  it('keeps each viewer’s starred messages when that viewer clears the chat', async () => {
    const [alice, bob] = await Promise.all([
      createUser('Alice Learner', 'alice'),
      createUser('Bob Learner', 'bob'),
    ]);
    await Friend.create({
      userId: alice._id,
      friendId: bob._id,
      status: 'active',
      deletedAt: null,
    });
    const { useCases } = createChatComposition();
    const { conversation } = await useCases.startConversation.execute(alice.id, {
      friendUserId: bob.id,
    });
    const first = await useCases.sendMessage.execute(alice.id, {
      conversationId: conversation.id,
      kind: 'text',
      text: 'Remove this message',
    });
    const starred = await useCases.sendMessage.execute(bob.id, {
      conversationId: conversation.id,
      kind: 'text',
      text: 'Keep this message',
    });
    await useCases.sendMessage.execute(alice.id, {
      conversationId: conversation.id,
      kind: 'text',
      text: 'Remove this too',
    });

    await expect(
      useCases.toggleMessageStar.execute(alice.id, starred.id)
    ).resolves.toMatchObject({ id: starred.id, isStarred: true });
    await expect(
      useCases.clearConversation.execute(alice.id, conversation.id)
    ).resolves.toMatchObject({ clearedCount: 2, preservedStarredMessages: true });

    const aliceMessages = await useCases.listMessages.execute(
      alice.id,
      conversation.id,
      { page: 1, limit: 30 }
    );
    expect(aliceMessages.items).toEqual([
      expect.objectContaining({
        id: starred.id,
        text: 'Keep this message',
        isStarred: true,
      }),
    ]);
    const aliceConversations = await useCases.listConversations.execute(alice.id, {
      page: 1,
      limit: 30,
    });
    expect(aliceConversations.items[0]?.lastMessage?.id).toBe(starred.id);

    const bobMessages = await useCases.listMessages.execute(
      bob.id,
      conversation.id,
      { page: 1, limit: 30 }
    );
    expect(bobMessages.items.map((message) => message.id)).toEqual([
      first.id,
      starred.id,
      expect.any(String),
    ]);
    expect(bobMessages.items.every((message) => !message.isStarred)).toBe(true);
  });

  it('rejects conversations between users who are not friends', async () => {
    const [alice, stranger] = await Promise.all([
      createUser('Alice Learner', 'alice'),
      createUser('Other Learner', 'other'),
    ]);
    const { useCases } = createChatComposition();

    await expect(
      useCases.startConversation.execute(alice.id, { friendUserId: stranger.id })
    ).rejects.toMatchObject({ code: 'CHAT_NOT_FRIENDS' });
  });

  it('returns live and last-active presence only when the participant allows it', async () => {
    const [alice, bob] = await Promise.all([
      createUser('Alice Learner', 'alice'),
      createUser('Bob Learner', 'bob'),
    ]);
    await Friend.create({
      userId: alice._id,
      friendId: bob._id,
      status: 'active',
      deletedAt: null,
    });
    const { useCases } = createChatComposition();
    await useCases.startConversation.execute(alice.id, { friendUserId: bob.id });

    chatPresenceProvider.connect(bob.id, 'bob-test-connection');
    const visible = await useCases.listConversations.execute(alice.id, {
      page: 1,
      limit: 30,
    });
    expect(visible.items[0]?.participant).toMatchObject({
      id: bob.id,
      isOnline: true,
      presenceVisible: true,
    });
    expect(visible.items[0]?.participant.lastActiveAt).toBeInstanceOf(Date);

    await UserSettings.create({
      userId: bob._id,
      privacy: { showOnlineStatus: false },
    });
    const hidden = await useCases.listConversations.execute(alice.id, {
      page: 1,
      limit: 30,
    });
    expect(hidden.items[0]?.participant).toMatchObject({
      id: bob.id,
      isOnline: false,
      lastActiveAt: null,
      presenceVisible: false,
    });
    chatPresenceProvider.disconnect(bob.id, 'bob-test-connection');
  });

  it('blocks new messages until the blocker explicitly unblocks the friend', async () => {
    const [alice, bob] = await Promise.all([
      createUser('Alice Learner', 'alice'),
      createUser('Bob Learner', 'bob'),
    ]);
    await Friend.create({
      userId: alice._id,
      friendId: bob._id,
      status: 'active',
      deletedAt: null,
    });
    const { useCases } = createChatComposition();
    const { conversation } = await useCases.startConversation.execute(alice.id, {
      friendUserId: bob.id,
    });
    await User.updateOne(
      { _id: alice._id },
      { $set: { avatarUrl: 'https://cdn.example/alice-avatar.jpg' } }
    );
    chatPresenceProvider.connect(alice.id, 'alice-block-test');

    await expect(
      useCases.blockUser.execute(alice.id, { userId: bob.id })
    ).resolves.toEqual({
      blockedUserIds: [bob.id],
      blockedByUserIds: [],
    });
    await expect(useCases.listBlockedUsers.execute(bob.id)).resolves.toEqual({
      blockedUserIds: [],
      blockedByUserIds: [alice.id],
    });
    const blockedConversation = await useCases.listConversations.execute(bob.id, {
      page: 1,
      limit: 30,
    });
    expect(blockedConversation.items[0]?.participant).toMatchObject({
      id: alice.id,
      avatarUrl: null,
      isOnline: false,
      lastActiveAt: null,
      presenceVisible: false,
    });
    await expect(
      useCases.sendMessage.execute(bob.id, {
        conversationId: conversation.id,
        kind: 'text',
        text: 'Can you see this?',
      })
    ).rejects.toMatchObject({ code: 'CHAT_USER_BLOCKED' });

    await expect(
      useCases.unblockUser.execute(alice.id, { userId: bob.id })
    ).resolves.toEqual({ blockedUserIds: [], blockedByUserIds: [] });
    await expect(
      useCases.sendMessage.execute(bob.id, {
        conversationId: conversation.id,
        kind: 'text',
        text: 'Welcome back',
      })
    ).resolves.toMatchObject({ text: 'Welcome back' });
    chatPresenceProvider.disconnect(alice.id, 'alice-block-test');
  });

  it('forwards an existing message into another friend conversation', async () => {
    const [alice, bob, charlie] = await Promise.all([
      createUser('Alice Learner', 'alice'),
      createUser('Bob Learner', 'bob'),
      createUser('Charlie Learner', 'charlie'),
    ]);
    await Friend.create([
      {
        userId: alice._id,
        friendId: bob._id,
        status: 'active',
        deletedAt: null,
      },
      {
        userId: alice._id,
        friendId: charlie._id,
        status: 'active',
        deletedAt: null,
      },
    ]);
    const { useCases } = createChatComposition();
    const sourceConversation = await useCases.startConversation.execute(alice.id, {
      friendUserId: bob.id,
    });
    const targetConversation = await useCases.startConversation.execute(alice.id, {
      friendUserId: charlie.id,
    });
    const source = await useCases.sendMessage.execute(alice.id, {
      conversationId: sourceConversation.conversation.id,
      kind: 'code',
      text: 'const answer = 42;',
      codeLanguage: 'typescript',
    });

    const forwarded = await useCases.forwardMessage.execute(alice.id, {
      messageId: source.id,
      targetConversationId: targetConversation.conversation.id,
    });

    expect(forwarded).toMatchObject({
      kind: 'code',
      text: 'const answer = 42;',
      codeLanguage: 'typescript',
      isForwarded: true,
    });
    const targetMessages = await useCases.listMessages.execute(
      charlie.id,
      targetConversation.conversation.id,
      { page: 1, limit: 30 }
    );
    expect(targetMessages.items).toHaveLength(1);
    expect(targetMessages.items[0]?.isForwarded).toBe(true);
  });

  it('shares only publicly published trackers with a friend', async () => {
    const [alice, bob] = await Promise.all([
      createUser('Alice Learner', 'alice'),
      createUser('Bob Learner', 'bob'),
    ]);
    await Friend.create({
      userId: alice._id,
      friendId: bob._id,
      status: 'active',
      deletedAt: null,
    });
    const [privateTracker, publishedTracker] = await Promise.all([
      Tracker.create({
        ownerId: alice._id,
        title: 'Private roadmap',
        slug: 'private-roadmap',
        visibility: 'private',
        status: 'active',
      }),
      Tracker.create({
        ownerId: alice._id,
        title: 'Published roadmap',
        slug: 'published-roadmap',
        description: 'A public learning path.',
        visibility: 'public',
        status: 'active',
        publishedAt: new Date(),
      }),
    ]);
    await Tracker.collection.updateOne(
      { _id: publishedTracker._id },
      { $set: { moderationStatus: null } }
    );
    const { useCases } = createChatComposition();
    const { conversation } = await useCases.startConversation.execute(alice.id, {
      friendUserId: bob.id,
    });

    await expect(
      useCases.shareTracker.execute(alice.id, {
        trackerId: privateTracker.id,
        targetConversationId: conversation.id,
      })
    ).rejects.toMatchObject({ code: 'CHAT_TRACKER_NOT_SHAREABLE' });

    await expect(
      useCases.shareTracker.execute(alice.id, {
        trackerId: publishedTracker.id,
        targetConversationId: conversation.id,
      })
    ).resolves.toMatchObject({
      kind: 'tracker',
      sharedTracker: {
        trackerId: publishedTracker.id,
        title: 'Published roadmap',
        visibility: 'public',
      },
    });
  });

  it('shares a server-verified profile as a rich profile message', async () => {
    const [alice, bob, charlie] = await Promise.all([
      createUser('Alice Learner', 'alice'),
      createUser('Bob Learner', 'bob'),
      createUser('Charlie Mentor', 'charlie'),
    ]);
    await Promise.all([
      Friend.create({
        userId: alice._id,
        friendId: bob._id,
        status: 'active',
        deletedAt: null,
      }),
      UserProfile.create({
        userId: charlie._id,
        fullName: 'Charlie Mentor',
        headline: 'Mathematics mentor',
        publicProfileEnabled: true,
      }),
    ]);
    const { useCases } = createChatComposition();
    const { conversation } = await useCases.startConversation.execute(alice.id, {
      friendUserId: bob.id,
    });

    const message = await useCases.shareProfile.execute(alice.id, {
      username: 'charlie',
      targetConversationId: conversation.id,
    });

    expect(message).toMatchObject({
      kind: 'profile',
      text: '',
      sharedProfile: {
        userId: charlie.id,
        username: 'charlie',
        fullName: 'Charlie Mentor',
        headline: 'Mathematics mentor',
      },
    });
    const stored = await ChatMessage.findById(message.id).lean();
    expect(stored?.sharedProfile?.userId.toString()).toBe(charlie.id);
  });
});

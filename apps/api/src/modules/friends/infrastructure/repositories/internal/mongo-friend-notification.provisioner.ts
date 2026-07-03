import type mongoose from "mongoose";

import { Notification } from "../../../../../infrastructure/database/models/notification.model";

export class MongoFriendNotificationProvisioner {
  async createFriendRequestReceived(
    input: {
      receiverUserId: mongoose.Types.ObjectId;
      senderUserId: mongoose.Types.ObjectId;
      senderName: string;
      requestId: mongoose.Types.ObjectId;
    },
    session: mongoose.ClientSession,
  ): Promise<void> {
    await Notification.create(
      [
        {
          userId: input.receiverUserId,
          type: "friend_request_received",
          message: `${input.senderName} sent you a friend invite.`,
          isRead: false,
          deepLink: "/friends?tab=requests",
          metadata: {
            requestId: input.requestId.toString(),
            senderUserId: input.senderUserId.toString(),
          },
        },
      ],
      { session },
    );
  }

  async createFriendRequestAccepted(
    input: {
      senderUserId: mongoose.Types.ObjectId;
      receiverUserId: mongoose.Types.ObjectId;
      receiverName: string;
      requestId: mongoose.Types.ObjectId;
    },
    session: mongoose.ClientSession,
  ): Promise<void> {
    await Notification.create(
      [
        {
          userId: input.senderUserId,
          type: "friend_request_accepted",
          message: `${input.receiverName} accepted your friend invite.`,
          isRead: false,
          deepLink: "/friends",
          metadata: {
            requestId: input.requestId.toString(),
            friendUserId: input.receiverUserId.toString(),
          },
        },
      ],
      { session },
    );
  }
}

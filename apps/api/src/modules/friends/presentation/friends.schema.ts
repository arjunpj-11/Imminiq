import { z } from "zod";

import {
  FRIEND_REQUEST_MESSAGE_MAX_LENGTH,
  FRIENDS_DEFAULT_PAGE,
  FRIENDS_DEFAULT_PAGE_SIZE,
  FRIENDS_MAX_PAGE_SIZE,
  FRIENDS_SEARCH_MAX_LENGTH,
  FRIENDS_SEARCH_MIN_LENGTH,
} from "../domain/constants/friends.constants";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Identifier is invalid");

const pageSchema = z.coerce.number().int().min(1).default(FRIENDS_DEFAULT_PAGE);

const limitSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(FRIENDS_MAX_PAGE_SIZE)
  .default(FRIENDS_DEFAULT_PAGE_SIZE);

export const searchUsersQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(
      FRIENDS_SEARCH_MIN_LENGTH,
      `Search must contain at least ${FRIENDS_SEARCH_MIN_LENGTH} characters`,
    )
    .max(FRIENDS_SEARCH_MAX_LENGTH),
  page: pageSchema,
  limit: limitSchema,
});

export const listFriendsQuerySchema = z.object({
  q: z.string().trim().max(FRIENDS_SEARCH_MAX_LENGTH).optional(),
  page: pageSchema,
  limit: limitSchema,
});

export const listFriendRequestsQuerySchema = z.object({
  receivedPage: pageSchema,
  sentPage: pageSchema,
  limit: limitSchema,
});

export const sendFriendRequestSchema = z.object({
  receiverUserId: objectIdSchema,
  message: z.string().trim().max(FRIEND_REQUEST_MESSAGE_MAX_LENGTH).optional(),
});

export const friendRequestParamsSchema = z.object({
  requestId: objectIdSchema,
});

export const friendParamsSchema = z.object({
  friendUserId: objectIdSchema,
});

export type SearchUsersQuery = z.infer<typeof searchUsersQuerySchema>;
export type ListFriendsQuery = z.infer<typeof listFriendsQuerySchema>;
export type ListFriendRequestsQuery = z.infer<
  typeof listFriendRequestsQuerySchema
>;
export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;

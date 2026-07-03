import axios from "axios";

import type {
  FriendRequest,
  FriendUser,
  FriendsApiErrorResponse,
  FriendsTab,
} from "../types/friends.types";

export const getInitials = (value: string): string => {
  const initials = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "IU";
};

export const formatLevelLabel = (level: number): string =>
  `Level ${Math.max(1, Math.floor(level || 1))}`;

export const formatMutualFriends = (count: number): string => {
  const normalized = Math.max(0, Math.floor(count || 0));
  return `${normalized} mutual friend${normalized === 1 ? "" : "s"}`;
};

export const formatRequestTime = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = Date.now();
  const difference = Math.max(0, now - date.getTime());
  const minutes = Math.floor(difference / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
};

export const parseFriendsTab = (value: string | null): FriendsTab =>
  value === "requests" ? "requests" : "friends";

export const normalizeSearchQuery = (value: string): string =>
  value.trim().slice(0, 80);

export const mergeFriendUserPages = (
  pages: Array<{ items: FriendUser[] }>,
): FriendUser[] => {
  const users = new Map<string, FriendUser>();

  for (const page of pages) {
    for (const user of page.items) {
      users.set(user.id, user);
    }
  }

  return [...users.values()];
};

export const mergeFriendRequestPages = (
  pages: Array<{ items: FriendRequest[] }>,
): FriendRequest[] => {
  const requests = new Map<string, FriendRequest>();

  for (const page of pages) {
    for (const request of page.items) {
      requests.set(request.id, request);
    }
  }

  return [...requests.values()];
};

export const getFriendsApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (!axios.isAxiosError<FriendsApiErrorResponse>(error)) {
    return fallback;
  }

  return error.response?.data?.message || fallback;
};

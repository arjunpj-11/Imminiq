import type { ITrackerClanMessage } from '../types/tracker.types';

export const mergeGuildMessages = (history: ITrackerClanMessage[], live: ITrackerClanMessage[]) => {
  const byId = new Map(history.map((message) => [message.id, message]));
  for (const message of live) byId.set(message.id, message);
  return [...byId.values()].sort(
    (first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
  );
};

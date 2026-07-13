import { createContext } from 'react';

export interface IAppShellViewer {
  name?: string;
  initials?: string;
  avatarUrl?: string | null;
  streak?: number;
  levelLabel?: string;
  isPremium?: boolean;
  notificationCount?: number;
  messageCount?: number;
  friendRequestCount?: number;
}

export interface IAppShellContextValue {
  setViewer: (viewer: IAppShellViewer | null) => void;
}

export const AppShellContext = createContext<IAppShellContextValue | null>(null);

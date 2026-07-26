import { create } from 'zustand';

export type SocialTrackerShare = {
  trackerId: string;
  title: string;
  description: string;
};

export type SocialProfileShare = {
  username: string;
  name: string;
  url: string;
  avatarUrl: string | null;
};

type SocialShareState = {
  tracker: SocialTrackerShare | null;
  profile: SocialProfileShare | null;
  shareTracker: (tracker: SocialTrackerShare) => void;
  shareProfile: (profile: SocialProfileShare) => void;
  close: () => void;
};

export const useSocialShareStore = create<SocialShareState>((set) => ({
  tracker: null,
  profile: null,
  shareTracker: (tracker) => set({ tracker, profile: null }),
  shareProfile: (profile) => set({ profile, tracker: null }),
  close: () => set({ tracker: null, profile: null }),
}));

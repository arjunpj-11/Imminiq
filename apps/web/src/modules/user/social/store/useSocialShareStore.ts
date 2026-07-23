import { create } from 'zustand';

export type SocialTrackerShare = {
  trackerId: string;
  title: string;
  description: string;
};

type SocialShareState = {
  tracker: SocialTrackerShare | null;
  shareTracker: (tracker: SocialTrackerShare) => void;
  close: () => void;
};

export const useSocialShareStore = create<SocialShareState>((set) => ({
  tracker: null,
  shareTracker: (tracker) => set({ tracker }),
  close: () => set({ tracker: null }),
}));

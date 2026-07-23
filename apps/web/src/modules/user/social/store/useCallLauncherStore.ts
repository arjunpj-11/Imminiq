import { create } from 'zustand';

import type { CallLaunchTarget } from '../types/call.types';

type SocialCallLauncherState = {
  target: CallLaunchTarget | null;
  open: (target: CallLaunchTarget) => void;
  close: () => void;
};

export const useCallLauncherStore = create<SocialCallLauncherState>((set) => ({
  target: null,
  open: (target) => set({ target }),
  close: () => set({ target: null }),
}));

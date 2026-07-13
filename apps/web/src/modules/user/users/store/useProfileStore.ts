import { create } from 'zustand';

type BannerModalTab = 'defaults' | 'upload' | 'ai';

interface IProfileUIState {
  editPanelOpen: boolean;
  bannerModalOpen: boolean;
  avatarCropModalOpen: boolean;
  bannerModalTab: BannerModalTab;
  selectedBadgeId: string | null;
  selectedHeatmapYear: number;

  openEditPanel: () => void;
  closeEditPanel: () => void;

  openBannerModal: (tab?: BannerModalTab) => void;
  closeBannerModal: () => void;
  setBannerModalTab: (tab: BannerModalTab) => void;

  openAvatarCropModal: () => void;
  closeAvatarCropModal: () => void;

  setSelectedBadgeId: (badgeId: string | null) => void;
  setSelectedHeatmapYear: (year: number) => void;

  closeAllProfileOverlays: () => void;
}

const currentYear = new Date().getFullYear();

export const useProfileStore = create<IProfileUIState>((set) => ({
  editPanelOpen: false,
  bannerModalOpen: false,
  avatarCropModalOpen: false,
  bannerModalTab: 'defaults',
  selectedBadgeId: null,
  selectedHeatmapYear: currentYear,

  openEditPanel: () => set({ editPanelOpen: true }),
  closeEditPanel: () => set({ editPanelOpen: false }),

  openBannerModal: (tab = 'defaults') => set({ bannerModalOpen: true, bannerModalTab: tab }),
  closeBannerModal: () => set({ bannerModalOpen: false }),
  setBannerModalTab: (tab) => set({ bannerModalTab: tab }),

  openAvatarCropModal: () => set({ avatarCropModalOpen: true }),
  closeAvatarCropModal: () => set({ avatarCropModalOpen: false }),

  setSelectedBadgeId: (badgeId) => set({ selectedBadgeId: badgeId }),
  setSelectedHeatmapYear: (year) => set({ selectedHeatmapYear: year }),

  closeAllProfileOverlays: () =>
    set({
      editPanelOpen: false,
      bannerModalOpen: false,
      avatarCropModalOpen: false,
      selectedBadgeId: null,
    }),
}));

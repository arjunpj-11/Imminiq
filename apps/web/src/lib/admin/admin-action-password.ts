import { useAuthStore } from '../../store/useAuthStore';

export const isAdminActionPasswordReady = (value: string) =>
  useAuthStore.getState().user?.role === 'superadmin' ||
  (value.length >= 10 && value.length <= 128);

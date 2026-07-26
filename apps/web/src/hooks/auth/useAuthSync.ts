import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { resetClientState } from '../../store/reset-client-state';
import { ROUTES } from '../../routes/config/route-paths';
import { STORAGE_KEYS } from '../../lib/storage/storage-keys';

type AuthSyncPayload = {
  type?: 'EMAIL_CHANGED_LOGOUT';
  timestamp?: number;
};

export const useAuthSync = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEYS.authSync || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue) as AuthSyncPayload;

        if (payload.type === 'EMAIL_CHANGED_LOGOUT') {
          resetClientState();
          navigate(ROUTES.login, { replace: true });
        }
      } catch {
        // ignore malformed sync event
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [navigate]);
};

import { useEffect, useRef, useState } from 'react';

import { toast } from '../../lib/toast';

const CONNECTIVITY_CHECK_TIMEOUT_MS = 4_000;
const OFFLINE_RECHECK_INTERVAL_MS = 15_000;

async function canReachAppOrigin(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), CONNECTIVITY_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(`/robots.txt?connectivity-check=${Date.now()}`, {
      cache: 'no-store',
      credentials: 'same-origin',
      signal: controller.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export default function OnlineStatus() {
  // Start optimistically. `navigator.onLine` is only a browser/network-adapter
  // hint and can be false even while the app is reachable.
  const [online, setOnline] = useState(true);
  const wasOffline = useRef(false);

  useEffect(() => {
    let disposed = false;
    let latestCheck = 0;
    let recheckTimer: number | undefined;

    const markOffline = () => {
      if (disposed) return;
      wasOffline.current = true;
      setOnline(false);
    };

    const markOnline = () => {
      if (disposed) return;
      setOnline(true);
      if (wasOffline.current) {
        toast.success('You are back online', 'Live data can sync again.');
        wasOffline.current = false;
      }
    };

    const verifyConnection = async () => {
      const checkId = ++latestCheck;
      const reachable = await canReachAppOrigin();

      if (disposed || checkId !== latestCheck) return;

      if (reachable) {
        markOnline();
        return;
      }

      markOffline();
      recheckTimer = window.setTimeout(() => {
        void verifyConnection();
      }, OFFLINE_RECHECK_INTERVAL_MS);
    };

    const handleOffline = () => {
      window.clearTimeout(recheckTimer);
      void verifyConnection();
    };

    const handleOnline = () => {
      window.clearTimeout(recheckTimer);
      void verifyConnection();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    if (!navigator.onLine) {
      void verifyConnection();
    }

    return () => {
      disposed = true;
      latestCheck += 1;
      window.clearTimeout(recheckTimer);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-190 flex min-h-8 items-center justify-center bg-(--warning) px-4 py-1.5 text-center text-[11px] font-bold text-[#1a1714] shadow-(--shadow-1)"
    >
      You are offline. Read-only content remains available; changes will need a connection.
    </div>
  );
}

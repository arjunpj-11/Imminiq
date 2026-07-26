import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type BackNavigationState = {
  from?: unknown;
  returnTo?: unknown;
};

const isSafeInternalPath = (value: unknown): value is string =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');

const hasInAppHistory = () => {
  if (typeof window === 'undefined') return false;
  const state = window.history.state as { idx?: unknown } | null;
  return typeof state?.idx === 'number' && state.idx > 0;
};

/**
 * Returns to an explicit in-app origin when one was supplied, otherwise uses
 * the browser history. Direct-entry pages fall back to a safe product route.
 */
export function useBackNavigation(fallbackPath: string) {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    const state = location.state as BackNavigationState | null;
    const explicitOrigin = isSafeInternalPath(state?.returnTo)
      ? state.returnTo
      : isSafeInternalPath(state?.from)
        ? state.from
        : null;

    if (explicitOrigin) {
      navigate(explicitOrigin);
      return;
    }

    if (hasInAppHistory()) {
      navigate(-1);
      return;
    }

    navigate(fallbackPath, { replace: true });
  }, [fallbackPath, location.state, navigate]);
}

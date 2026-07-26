import { lazy, Suspense, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

import AppErrorBoundary from './components/system/AppErrorBoundary';
import NetworkRedirector from './components/system/NetworkRedirector';
import OnlineStatus from './components/system/OnlineStatus';
import RouteExperience from './components/system/RouteExperience';
import ToastProvider from './components/system/ToastProvider';
import CookieConsentBanner from './components/system/CookieConsentBanner';
import AppRoutes from './routes/AppRoutes';
import AuthSessionBridge from './routes/session/AuthSessionBridge';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';

const GlobalNavigationController = lazy(
  () => import('./components/navigation/GlobalNavigationController')
);
const CallManager = lazy(
  () => import('./modules/user/social/components/CallManager')
);
const ShareTrackerDialog = lazy(
  () => import('./modules/user/social/components/ShareTrackerDialog')
);

export default function App() {
  const initTheme = useThemeStore((state) => state.initTheme);
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useLayoutEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <AppErrorBoundary resetKey={location.pathname}>
      {isAuthenticated && (
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
      )}
      <NetworkRedirector />
      <OnlineStatus />
      <RouteExperience />
      <AuthSessionBridge />
      {isAuthenticated && (
        <Suspense fallback={null}>
          <GlobalNavigationController />
          <CallManager />
          <ShareTrackerDialog />
        </Suspense>
      )}
      <AppRoutes />
      <CookieConsentBanner />
      <ToastProvider />
    </AppErrorBoundary>
  );
}

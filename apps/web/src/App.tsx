import { lazy, Suspense, useLayoutEffect } from 'react';
import { useLocation } from 'react-router';

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
import { useAppShellStore } from './store/useAppShellStore';
import { useFeatureAvailability } from './hooks/useFeatureAvailability';

const GlobalNavigationController = lazy(
  () => import('./components/navigation/GlobalNavigationController')
);
const CallManager = lazy(() => import('./modules/user/social/components/CallManager'));
const ShareTrackerDialog = lazy(
  () => import('./modules/user/social/components/ShareTrackerDialog')
);

export default function App() {
  const initTheme = useThemeStore((state) => state.initTheme);
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const contentDensity = useAppShellStore((state) => state.contentDensity);
  const reduceMotion = useAppShellStore((state) => state.reduceMotion);
  const featureQuery = useFeatureAvailability(isAuthenticated);
  const features = featureQuery.data;

  useLayoutEffect(() => {
    initTheme();
  }, [initTheme]);

  useLayoutEffect(() => {
    document.documentElement.dataset.density = contentDensity;
    document.documentElement.dataset.reduceMotion = String(reduceMotion);
  }, [contentDensity, reduceMotion]);

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
          {features?.social && features.calls ? <CallManager /> : null}
          {features?.social && features.trackers ? <ShareTrackerDialog /> : null}
        </Suspense>
      )}
      <AppRoutes />
      <CookieConsentBanner />
      <ToastProvider />
    </AppErrorBoundary>
  );
}

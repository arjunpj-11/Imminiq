import { lazy, Suspense } from 'react';
import { useRoutes, type RouteObject } from 'react-router-dom';

import PageLoadingScreen from '../components/ui/PageLoadingScreen';
import NotFoundPage from '../pages/NotFoundPage';
import { AdminRoute } from './guards/AdminRoute';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { adminRoutes } from './groups/admin.routes';
import { authenticatedRoutes } from './groups/authenticated.routes';
import { focusedRoutes } from './groups/focused.routes';
import { trackerCreationRoutes } from './groups/tracker-creation.routes';
import { publicRoutes } from './groups/public.routes';

const AuthenticatedAppLayout = lazy(
  () => import('../components/layout/AuthenticatedAppLayout'),
);

const routes: RouteObject[] = [
  ...publicRoutes,
  {
    element: <ProtectedRoute />,
    children: [
      ...trackerCreationRoutes,
      ...focusedRoutes,
      {
        element: <AuthenticatedAppLayout />,
        children: authenticatedRoutes,
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: adminRoutes,
  },
  { path: '*', element: <NotFoundPage /> },
];

const loadingFallback = <PageLoadingScreen />;

export default function AppRoutes() {
  return <Suspense fallback={loadingFallback}>{useRoutes(routes)}</Suspense>;
}

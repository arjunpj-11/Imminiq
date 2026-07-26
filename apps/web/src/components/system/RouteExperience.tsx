import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

import { getRouteName } from './route-experience-metadata';

const positions = new Map<string, number>();

export default function RouteExperience() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousPath = useRef(location.pathname);

  const routeName = getRouteName(location.pathname);
  const announcement = `${routeName} page loaded`;

  useEffect(() => {
    document.title = routeName === 'Imminiq' ? 'Imminiq' : `${routeName} · Imminiq`;
  }, [routeName]);

  useEffect(() => {
    const oldPath = previousPath.current;

    if (oldPath === location.pathname) {
      return;
    }

    positions.set(oldPath, window.scrollY);
    previousPath.current = location.pathname;

    const frameId = window.requestAnimationFrame(() => {
      const nextScrollPosition =
        navigationType === 'POP' ? (positions.get(location.pathname) ?? 0) : 0;

      window.scrollTo({
        top: nextScrollPosition,
        behavior: 'auto',
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [location.pathname, navigationType]);

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  );
}

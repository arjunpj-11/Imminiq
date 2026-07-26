import { Cookie } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';

import { ROUTES } from '../../routes/config/route-paths';
import { cn } from '../../lib/cn';

const CONSENT_KEY = 'imminiq.cookie-notice.v1';

export default function CookieConsentBanner() {
  const location = useLocation();
  const [visible, setVisible] = useState(() => {
    try {
      return window.localStorage.getItem(CONSENT_KEY) !== 'acknowledged';
    } catch {
      return true;
    }
  });

  if (!visible) return null;

  const acknowledge = () => {
    try {
      window.localStorage.setItem(CONSENT_KEY, 'acknowledged');
    } catch {
      // The notice can still be dismissed for the current page when storage is unavailable.
    }
    setVisible(false);
  };

  return (
    <aside
      className={cn(
        'fixed inset-x-3 z-180 mx-auto max-w-2xl rounded-2xl border border-(--border-subtle) bg-(--surface-elevated) p-3.5 shadow-(--shadow-3) backdrop-blur-xl sm:bottom-5 sm:flex sm:items-center sm:gap-4 sm:p-4',
        location.pathname === ROUTES.home
          ? 'bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:bottom-21'
          : 'bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))]'
      )}
      aria-label="Cookie notice"
      aria-live="polite"
    >
      <span className="mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--brand-500)_12%,transparent)] text-(--brand-500) sm:mb-0 sm:h-10 sm:w-10">
        <Cookie size={18} aria-hidden="true" />
      </span>
      <p className="m-0 min-w-0 flex-1 text-[12px] leading-5 text-(--text-secondary)">
        We use essential cookies for secure sign-in and local storage for preferences and drafts. No
        advertising cookies.{' '}
        <Link to={ROUTES.privacy} className="font-bold text-(--brand-500)">
          Privacy details
        </Link>
      </p>
      <button
        type="button"
        onClick={acknowledge}
        className="mt-3 min-h-11 w-full rounded-xl bg-(--brand-500) px-5 text-[13px] font-bold text-(--brand-contrast) transition hover:bg-(--brand-600) focus-visible:outline-none sm:mt-0 sm:w-auto"
      >
        Got it
      </button>
    </aside>
  );
}

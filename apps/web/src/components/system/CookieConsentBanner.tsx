import { Cookie } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from '../../routes/config/route-paths';

const CONSENT_KEY = 'imminiq.cookie-notice.v1';

export default function CookieConsentBanner() {
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
      className="fixed inset-x-3 bottom-3 z-180 mx-auto max-w-2xl rounded-2xl border border-(--border-subtle) bg-(--surface-elevated) p-4 shadow-(--shadow-3) sm:bottom-5 sm:flex sm:items-center sm:gap-4"
      aria-label="Cookie notice"
    >
      <span className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--brand-500)_12%,transparent)] text-(--brand-500) sm:mb-0">
        <Cookie size={18} />
      </span>
      <p className="m-0 min-w-0 flex-1 text-[11px] leading-5 text-(--text-secondary)">
        Imminiq uses strictly necessary cookies for sign-in and account security, plus local
        storage for preferences and drafts. We do not use advertising cookies.{' '}
        <Link to={ROUTES.privacy} className="font-bold text-(--brand-500)">
          Privacy details
        </Link>
      </p>
      <button
        type="button"
        onClick={acknowledge}
        className="mt-3 min-h-10 w-full rounded-xl bg-(--brand-500) px-5 text-[11px] font-bold text-(--brand-contrast) sm:mt-0 sm:w-auto"
      >
        Got it
      </button>
    </aside>
  );
}

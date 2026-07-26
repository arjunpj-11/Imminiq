import { Wrench } from 'lucide-react';
import { Link } from 'react-router';

import { AppShellBoundary } from '../components/layout/AppShell';
import PageContainer from '../components/layout/PageContainer';
import { FEATURE_LABELS, type FeatureKey } from '../config/feature-availability';
import { ROUTES } from '../routes/config/route-paths';

export default function FeatureUnavailablePage({ feature }: { feature: FeatureKey }) {
  const label = FEATURE_LABELS[feature];

  return (
    <AppShellBoundary>
      <PageContainer>
        <section
          className="mx-auto max-w-2xl rounded-3xl border border-(--border-subtle) bg-(--surface-card) px-6 py-14 text-center shadow-(--shadow-1) sm:px-10"
          role="status"
          aria-live="polite"
        >
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-500)_10%,transparent)] text-(--brand-500)">
            <Wrench size={25} aria-hidden="true" />
          </span>
          <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--brand-500)">
            Temporarily paused
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-(--text-primary)">
            {label} is under maintenance
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-(--text-secondary)">
            This area has been temporarily turned off by the platform team. Your existing
            information is safe, and the page will become available automatically when maintenance
            is complete.
          </p>
          <Link
            to={ROUTES.dashboard}
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-(--brand-500) px-5 text-sm font-bold text-(--brand-contrast) no-underline transition hover:bg-(--brand-600)"
          >
            Return to dashboard
          </Link>
        </section>
      </PageContainer>
    </AppShellBoundary>
  );
}

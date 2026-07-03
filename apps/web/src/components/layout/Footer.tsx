import { Link } from 'react-router-dom'

import ImminiqWordmark from '../ui/ImminiqWordmark'

const footerLinks = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Academic integrity', to: '/terms#academic-integrity' },
]

export default function AppFooter() {
  return (
    <footer className="relative z-1 mt-auto flex w-full flex-col items-center justify-between gap-3 border-t border-(--border-subtle) bg-[color-mix(in_srgb,var(--surface-canvas)_92%,transparent)] px-7 py-4 backdrop-blur-xl max-[640px]:px-4 min-[641px]:flex-row min-[641px]:flex-wrap">
      <ImminiqWordmark className="text-[15px] font-[740] tracking-tight" />

      <nav className="flex flex-wrap justify-center gap-5" aria-label="Footer navigation">
        {footerLinks.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className="font-mono text-[9px] uppercase tracking-[0.08em] text-(--text-muted) no-underline transition hover:text-(--brand-500)"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="font-mono text-[9px] tracking-[0.04em] text-(--text-muted) max-[640px]:text-center">
        © {new Date().getFullYear()} Imminiq
      </div>
    </footer>
  )
}

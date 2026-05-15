const footerLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Academic Integrity', href: '#' },
  { label: 'Contact', href: '#' },
]

export default function AppFooter() {
  return (
    <footer className="relative z-[1] mt-auto flex w-full flex-col items-center justify-between gap-3 border-t border-[#e0d0c5] bg-[rgba(245,237,228,0.92)] px-7 py-[18px] shadow-[0_-1px_0_rgba(253,248,245,0.6)] backdrop-blur-[24px] saturate-[1.4] dark:border-white/[0.09] dark:bg-[rgba(20,20,18,0.92)] max-[640px]:px-4 min-[641px]:flex-row min-[641px]:flex-wrap">
      <div className="font-['Playfair_Display',serif] text-[16px] font-extrabold text-[#b84c2b] dark:text-[#e8816a]">
        Imminiq
      </div>

      <div className="flex flex-wrap justify-center gap-5">
        {footerLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#6b5f58] no-underline opacity-50 transition hover:text-[#b84c2b] hover:opacity-100 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="font-['DM_Mono',monospace] text-[8.5px] tracking-[0.06em] text-[#6b5f58] opacity-40 dark:text-[#9b9a92] max-[640px]:text-center">
        © 2025 Imminiq. Scholarly Rigor, Digital Craft.
      </div>
    </footer>
  )
}

import SectionCard from '../../../components/layout/SectionCard'
import { cn } from '../../../lib/cn'
import type { ProfileData } from '../types/profile.types'

interface ProfileAboutCardProps {
  profile: ProfileData
  onMissingLink: (label: string) => void
}

const intentions = ['Open to Collaboration', 'Mentoring Beginners']

export default function ProfileAboutCard({
  profile,
  onMissingLink,
}: ProfileAboutCardProps) {
  const links = [
    { label: 'GitHub', url: profile.githubUrl, icon: <GitHubIcon /> },
    { label: 'LinkedIn', url: profile.linkedinUrl, icon: <LinkedInIcon /> },
    { label: 'Portfolio', url: profile.portfolioUrl, icon: <PortfolioIcon /> },
  ]

  return (
    <SectionCard className="p-6 animate-[fadeUp_0.38s_ease_0.18s_both]">
      <h2 className="mb-3 font-['Playfair_Display',serif] text-[22px] font-extrabold tracking-[-0.4px] text-[#1a1714] dark:text-[#f2f0eb]">
        About {profile.name.split(' ')[0]}
      </h2>
      <p className="mb-5 text-[13.5px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
        {profile.bio}
      </p>

      <ProfileSectionLabel>Skills</ProfileSectionLabel>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {profile.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-[7px] border border-[#e0d0c5] bg-[rgba(26,23,20,0.09)] px-3 py-1.25 text-[12px] font-medium text-[#1a1714] dark:border-white/9 dark:bg-[rgba(242,240,235,0.09)] dark:text-[#f2f0eb]"
          >
            {skill}
          </span>
        ))}
      </div>

      <ProfileSectionLabel>Intentions</ProfileSectionLabel>
      <div className="mb-5 flex flex-col gap-1.75">
        {intentions.map((intention) => (
          <div
            key={intention}
            className="flex items-center gap-2 text-[13px] text-[#6b5f58] dark:text-[#9b9a92]"
          >
            <CheckIcon />
            {intention}
          </div>
        ))}
      </div>

      <ProfileSectionLabel>Links</ProfileSectionLabel>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url || '#'}
            target={link.url ? '_blank' : undefined}
            rel={link.url ? 'noreferrer' : undefined}
            onClick={(event) => {
              if (link.url) return
              event.preventDefault()
              onMissingLink(link.label)
            }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-[#e0d0c5] px-3.5 py-1.75 text-[12px] font-medium text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92]',
              !link.url && 'opacity-55',
            )}
          >
            {link.icon}
            {link.label}
          </a>
        ))}
      </div>
    </SectionCard>
  )
}

function ProfileSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.16em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
      {children}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4caf7d" strokeWidth="2.5" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function PortfolioIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  )
}

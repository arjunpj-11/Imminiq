import { Link } from 'react-router-dom';

import {
  BodyP,
  EmailLink,
  HighlightCard,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconDoc,
  IconShield,
  LogoIcon,
  Section,
  Tag,
  TermsList,
} from '../components/LegalShared';

import { cn, scrollbarClass } from '../utils/legal-ui';
import { useLegalDocumentNavigation } from '../hooks/useLegalDocumentNavigation';

const TOC = [
  { id: 's1', num: '01', label: 'Introduction' },
  { id: 's2', num: '02', label: 'Information We Collect' },
  { id: 's3', num: '03', label: 'How We Use Your Data' },
  { id: 's4', num: '04', label: 'Legal Basis' },
  { id: 's5', num: '05', label: 'Data Sharing' },
  { id: 's6', num: '06', label: 'AI & Learning Data' },
  { id: 's7', num: '07', label: 'Cookies & Tracking' },
  { id: 's8', num: '08', label: 'Data Retention' },
  { id: 's9', num: '09', label: 'Security' },
  { id: 's10', num: '10', label: 'Your Rights' },
  { id: 's11', num: '11', label: "Children's Privacy" },
  { id: 's12', num: '12', label: 'International Transfers' },
  { id: 's13', num: '13', label: 'Third-Party Links' },
  { id: 's14', num: '14', label: 'Changes to Policy' },
  { id: 's15', num: '15', label: 'Contact & DPO' },
];

export default function PrivacyPage() {
  const { activeId, readPct, scrollAreaRef, handleBack, handleTocClick } =
    useLegalDocumentNavigation();

  return (
    <div
      id="privacy-page"
      className="h-screen overflow-hidden bg-(--surface-canvas) text-(--text-primary) font-[DM_Sans,sans-serif] dark:bg-(--surface-canvas) dark:text-(--text-primary)"
    >
      <div
        aria-hidden="true"
        className="fixed left-0 top-0 z-100 h-0.5 bg-linear-to-r from-(--brand-500) to-(--brand-500) transition-[width] duration-100"
        style={{ width: `${readPct}%` }}
      />

      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <nav
          className="z-50 flex shrink-0 items-center justify-between gap-4 border-b border-(--border-subtle) bg-(--surface-canvas)/95 px-5 py-3.5 backdrop-blur-xl dark:border-white/15 dark:bg-(--surface-canvas)/95 lg:px-12 xl:px-16"
          aria-label="Site navigation"
        >
          <div className="flex min-w-0 items-center gap-4">
            <Link
              to="/"
              className="inline-flex shrink-0 items-center gap-2.5 leading-none"
              aria-label="Imminiq home"
            >
              <LogoIcon className="h-8.5 w-8.5" />

              <span className="text-xl font-bold leading-none tracking-[-0.5px] text-(--text-primary) dark:text-(--text-primary)">
                immin
                <span className="text-(--brand-500) dark:text-(--brand-500)">iq</span>
                <span className="text-(--brand-500) dark:text-(--brand-500)">.</span>
              </span>
            </Link>

            <div
              className="hidden h-4.5 w-px bg-(--border-subtle) dark:bg-white/15 sm:block"
              aria-hidden="true"
            />

            <span className="hidden truncate font-mono text-[9.5px] uppercase tracking-[0.14em] text-(--text-secondary) dark:text-(--text-secondary) sm:block">
              Scholarly Privacy Policy
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={handleBack}
              className="group inline-flex items-center gap-1.5 bg-transparent px-1 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-(--text-secondary) transition hover:text-(--brand-500) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
            >
              <IconArrowLeft className="transition group-hover:-translate-x-0.5" />
              Back
            </button>
          </div>
        </nav>

        <div className="mx-auto flex min-h-0 w-full max-w-300 flex-1 items-start gap-12 overflow-hidden px-5 lg:gap-14 lg:px-12 xl:px-16">
          <aside
            className={cn(
              'hidden h-full w-60 shrink-0 overflow-y-auto py-7 pr-2 lg:block',
              scrollbarClass
            )}
            aria-label="Table of contents"
          >
            <div className="mb-3 px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-(--text-secondary) dark:text-(--text-secondary)">
              Contents
            </div>

            <ul className="flex flex-col gap-0.5">
              {TOC.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleTocClick(e, item.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] leading-snug text-(--text-secondary) transition hover:bg-[rgba(184,76,43,0.06)] hover:text-(--brand-500) dark:text-(--text-secondary) dark:hover:bg-[rgba(232,129,106,0.08)] dark:hover:text-(--brand-500)',
                      activeId === item.id &&
                        'bg-[rgba(184,76,43,0.06)] font-medium text-(--brand-500) dark:bg-[rgba(232,129,106,0.08)] dark:text-(--brand-500)'
                    )}
                  >
                    <span
                      className={cn(
                        'min-w-4 shrink-0 font-mono text-[9px] text-(--border-subtle) transition dark:text-white/20',
                        activeId === item.id && 'text-(--brand-500) dark:text-[#f5a090]'
                      )}
                    >
                      {item.num}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mx-3 my-3 h-px bg-(--border-subtle) dark:bg-white/15" />

            <div className="px-3 font-mono text-[9px] tracking-[0.06em] text-(--text-secondary)/60 dark:text-(--text-secondary)/60">
              Version 6.6.2 · May 2026
            </div>
          </aside>

          <main
            ref={scrollAreaRef}
            className={cn(
              'h-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden py-10 pb-20 pr-1',
              scrollbarClass
            )}
            aria-label="Privacy policy content"
          >
            <div className="pp-section mb-12 border-b border-[rgba(184,76,43,0.10)] pb-9 dark:border-[rgba(232,129,106,0.12)]">
              <div className="mb-4.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.07em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-(--brand-500)">
                <span className="h-1.25 w-1.25 animate-pulse rounded-full bg-(--brand-500) dark:bg-(--brand-500)" />
                Privacy First
              </div>

              <h1 className="mb-3.5 font-serif text-[clamp(30px,5vw,48px)] font-extrabold leading-[1.08] tracking-[-1px] text-(--text-primary) dark:text-(--text-primary)">
                Scholarly Privacy Policy
              </h1>

              <p className="mb-5 max-w-150 text-[15px] leading-[1.7] text-(--text-secondary) dark:text-(--text-secondary)">
                We believe your learning data is yours. This policy explains what we collect, why we
                collect it, who sees it, and the controls you have over it — written in plain
                language.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                {['Effective: 1 May 2026', 'Last Updated: 10 May 2026', 'Version 6.6.2'].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-(--text-secondary) dark:text-(--text-secondary)"
                    >
                      <span className="text-(--brand-500) opacity-70 dark:text-(--brand-500)">
                        <IconShield className="h-3 w-3" />
                      </span>
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mb-11 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {[
                {
                  title: 'No data selling',
                  desc: 'We never sell your personal information or learning data.',
                  variant: 'green',
                },
                {
                  title: 'You stay in control',
                  desc: 'Download, correct, or delete your data from account settings.',
                  variant: 'amber',
                },
                {
                  title: 'Secure by design',
                  desc: 'JWT auth, HTTP-only cookies, bcrypt hashing, and encrypted storage.',
                  variant: 'rust',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={cn(
                    'flex items-start gap-3 rounded-md border p-4',
                    item.variant === 'green' &&
                      'border-[rgba(76,175,125,0.20)] bg-[rgba(76,175,125,0.07)] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.08)]',
                    item.variant === 'amber' &&
                      'border-[rgba(240,165,0,0.22)] bg-[rgba(240,165,0,0.07)] dark:border-[rgba(240,168,66,0.24)] dark:bg-[rgba(240,168,66,0.08)]',
                    item.variant === 'rust' &&
                      'border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.05)] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.07)]'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      item.variant === 'green' &&
                        'bg-[rgba(76,175,125,0.12)] text-(--success) dark:bg-[rgba(92,201,138,0.12)] dark:text-(--success)',
                      item.variant === 'amber' &&
                        'bg-[rgba(240,165,0,0.12)] text-[#f0a500] dark:bg-[rgba(240,168,66,0.12)] dark:text-(--warning)',
                      item.variant === 'rust' &&
                        'bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:bg-[rgba(232,129,106,0.09)] dark:text-(--brand-500)'
                    )}
                  >
                    <IconCheck className="h-4 w-4" />
                  </div>

                  <div>
                    <strong className="mb-0.5 block text-[12.5px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                      {item.title}
                    </strong>
                    <span className="text-xs leading-normal text-(--text-secondary) dark:text-(--text-secondary)">
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Section id="s1" num="01" title="Introduction">
              <BodyP>
                This Scholarly Privacy Policy describes how Imminiq collects, uses, stores, and
                shares information when you use our website, applications, APIs, and learning
                services.
              </BodyP>

              <BodyP>
                By using Imminiq, you agree to this policy. If you do not agree, please stop using
                the platform and contact us for help with data deletion.
              </BodyP>
            </Section>

            <Section id="s2" num="02" title="Information We Collect">
              <BodyP>
                We collect information you provide directly, information generated while using the
                platform, and limited technical data required to operate the service.
              </BodyP>

              <div className="overflow-x-auto rounded-xl border border-(--border-subtle) dark:border-white/15">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[rgba(184,76,43,0.08)] dark:bg-[rgba(232,129,106,0.09)]">
                      {['Category', 'Examples', 'Purpose'].map((heading) => (
                        <th
                          key={heading}
                          className="whitespace-nowrap border-b border-(--border-subtle) px-4 py-3 text-left font-mono text-[9.5px] uppercase tracking-widest text-(--brand-500) dark:border-white/15 dark:text-(--brand-500)"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {[
                      [
                        'Account data',
                        'Name, username, email, phone, avatar, password hash',
                        'Create and secure your account',
                      ],
                      [
                        'Learning data',
                        'Trackers, progress, mock tests, answers, streaks',
                        'Personalize your roadmap and analytics',
                      ],
                      [
                        'Billing data',
                        'Plan, subscription, payment references',
                        'Manage paid features and invoices',
                      ],
                      [
                        'Technical data',
                        'IP address, device, browser, logs',
                        'Security, debugging, abuse prevention',
                      ],
                    ].map(([category, examples, purpose]) => (
                      <tr
                        key={category}
                        className="even:bg-[rgba(26,23,20,0.025)] dark:even:bg-white/3"
                      >
                        <td className="border-b border-(--border-subtle) px-4 py-3 align-top font-semibold text-(--text-primary) dark:border-white/15 dark:text-(--text-primary)">
                          {category}
                        </td>
                        <td className="border-b border-(--border-subtle) px-4 py-3 align-top leading-normal text-(--text-secondary) dark:border-white/15 dark:text-(--text-secondary)">
                          {examples}
                        </td>
                        <td className="border-b border-(--border-subtle) px-4 py-3 align-top leading-normal text-(--text-secondary) dark:border-white/15 dark:text-(--text-secondary)">
                          {purpose}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="s3" num="03" title="How We Use Your Data">
              <TermsList
                variant="check"
                items={[
                  'To create and manage your Imminiq account.',
                  'To generate personalized learning trackers, AI explanations, mock tests, and progress summaries.',
                  'To operate community features such as publishing, comments, likes, verification, and referrals.',
                  'To process subscriptions, payments, invoices, and support requests.',
                  'To detect abuse, prevent fraud, improve reliability, and secure the platform.',
                ]}
              />
            </Section>

            <Section id="s4" num="04" title="Legal Basis">
              <BodyP>
                We process your data only when we have a valid reason, such as providing the
                service, protecting our platform, meeting legal obligations, or using data with your
                consent.
              </BodyP>

              <HighlightCard label="Consent">
                Optional features such as analytics cookies, marketing messages, public profile
                visibility, and community sharing can be controlled from settings.
              </HighlightCard>
            </Section>

            <Section id="s5" num="05" title="Data Sharing">
              <BodyP>
                We do not sell your personal data. We share data only with trusted service providers
                when required to run Imminiq.
              </BodyP>

              <div className="flex flex-wrap gap-2">
                {[
                  'Cloud hosting',
                  'Email delivery',
                  'Payment provider',
                  'AI provider',
                  'Analytics',
                  'Error tracking',
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-(--border-subtle) bg-white px-3 py-1.5 text-xs font-medium text-(--text-primary) dark:border-white/15 dark:bg-(--surface-elevated) dark:text-(--text-primary)"
                  >
                    <IconDoc className="text-(--brand-500) opacity-70 dark:text-(--brand-500)" />
                    {item}
                  </span>
                ))}
              </div>
            </Section>

            <Section id="s6" num="06" title="AI & Learning Data">
              <BodyP>
                Imminiq uses AI to generate roadmaps, explanations, summaries, mock tests, and
                learning insights. Inputs may include your survey answers, selected field, skill
                level, goals, tracker data, and learning progress.
              </BodyP>

              <HighlightCard label="Daily Quota" variant="green">
                AI usage is metered by subscription plan. Free users have a smaller daily quota than
                Pro and Premium users. Quota data may be stored with your user settings and usage
                records.
              </HighlightCard>
            </Section>

            <Section id="s7" num="07" title="Cookies & Tracking Technologies">
              <BodyP>
                We use cookies to keep you logged in, remember preferences, and understand basic
                platform usage. We do not use advertising or cross-site tracking cookies.
              </BodyP>

              <div className="overflow-x-auto rounded-xl border border-(--border-subtle) dark:border-white/15">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[rgba(184,76,43,0.08)] dark:bg-[rgba(232,129,106,0.09)]">
                      {['Cookie Type', 'Purpose', 'Duration', 'Required?'].map((heading) => (
                        <th
                          key={heading}
                          className="whitespace-nowrap border-b border-(--border-subtle) px-4 py-3 text-left font-mono text-[9.5px] uppercase tracking-widest text-(--brand-500) dark:border-white/15 dark:text-(--brand-500)"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {[
                      [
                        'Authentication',
                        'HTTP-only session and refresh cookies',
                        'Session / 30 days',
                        'Essential',
                        'rust',
                      ],
                      ['Preferences', 'Theme, language, timezone', '1 year', 'Essential', 'rust'],
                      [
                        'Analytics',
                        'Anonymised page views and usage',
                        '90 days',
                        'Optional',
                        'amber',
                      ],
                      [
                        'Error tracking',
                        'Application error context',
                        'Session',
                        'Optional',
                        'amber',
                      ],
                    ].map(([type, purpose, duration, required, variant]) => (
                      <tr
                        key={type}
                        className="even:bg-[rgba(26,23,20,0.025)] dark:even:bg-white/3"
                      >
                        <td className="border-b border-(--border-subtle) px-4 py-3 align-top font-semibold text-(--text-primary) dark:border-white/15 dark:text-(--text-primary)">
                          {type}
                        </td>
                        <td className="border-b border-(--border-subtle) px-4 py-3 align-top text-(--text-secondary) dark:border-white/15 dark:text-(--text-secondary)">
                          {purpose}
                        </td>
                        <td className="border-b border-(--border-subtle) px-4 py-3 align-top text-(--text-secondary) dark:border-white/15 dark:text-(--text-secondary)">
                          {duration}
                        </td>
                        <td className="border-b border-(--border-subtle) px-4 py-3 align-top dark:border-white/15">
                          <Tag variant={variant as 'rust' | 'amber'}>{required}</Tag>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="s8" num="08" title="Data Retention">
              <BodyP>
                We keep data only for as long as needed to provide the service, comply with legal
                obligations, resolve disputes, prevent abuse, and maintain platform security.
              </BodyP>

              <TermsList
                items={[
                  'Account data is retained while your account is active.',
                  'Deleted accounts are removed or anonymised within a reasonable period unless legal retention is required.',
                  'Security logs may be retained for abuse prevention and auditing.',
                  'Payment records may be retained for tax, invoice, and compliance purposes.',
                ]}
              />
            </Section>

            <Section id="s9" num="09" title="Security">
              <BodyP>
                We use technical and organisational safeguards to protect your data. No online
                platform can guarantee absolute security, but we design Imminiq with strong
                protections from the start.
              </BodyP>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ['Authentication', 'JWT sessions, refresh-token rotation, HTTP-only cookies.'],
                  ['Passwords', 'Passwords are hashed using strong one-way hashing.'],
                  ['Access control', 'Role-based access for admin and moderation features.'],
                  ['Monitoring', 'Logs and alerts for abuse, errors, and suspicious activity.'],
                ].map(([title, desc]) => (
                  <div
                    key={title}
                    className="rounded-md border border-(--border-subtle) bg-white p-4 dark:border-white/15 dark:bg-(--surface-elevated)"
                  >
                    <strong className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                      <IconShield className="text-(--brand-500) dark:text-(--brand-500)" />
                      {title}
                    </strong>
                    <p className="m-0 text-[12.5px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="s10" num="10" title="Your Rights">
              <BodyP>
                Depending on your location, you may have the right to access, correct, export,
                restrict, or delete your personal data.
              </BodyP>

              <TermsList
                variant="check"
                items={[
                  'Access a copy of your personal data.',
                  'Correct inaccurate account or profile information.',
                  'Delete your account and associated learning data.',
                  'Withdraw optional consent for analytics, marketing, or public sharing.',
                  'Contact us for privacy requests. We aim to respond within 30 days.',
                ]}
              />

              <HighlightCard label="Response Time" variant="green">
                We aim to respond to reasonable privacy requests within 30 days. We will not charge
                a fee for reasonable requests.
              </HighlightCard>
            </Section>

            <Section id="s11" num="11" title="Children's Privacy">
              <BodyP>
                Imminiq is intended for users aged 13 and above. We do not knowingly collect
                personal data from children under 13.
              </BodyP>

              <BodyP>
                If we discover that we collected personal data from a child under 13 without
                parental consent, we will take steps to delete that information. Contact us at{' '}
                <EmailLink>privacy@imminiq.com</EmailLink>.
              </BodyP>
            </Section>

            <Section id="s12" num="12" title="International Data Transfers">
              <BodyP>
                Imminiq may process data in countries outside your country of residence. Data
                protection laws may differ depending on where the service provider operates.
              </BodyP>

              <TermsList
                items={[
                  'We use data processing agreements with third-party providers.',
                  'We prefer providers with recognised security certifications.',
                  'We use appropriate safeguards where international transfers are required.',
                ]}
              />
            </Section>

            <Section id="s13" num="13" title="Third-Party Links & Services">
              <BodyP>
                The platform may contain links to external websites, GitHub repositories, academic
                resources, or third-party tools. These external sites are not operated by Imminiq.
              </BodyP>

              <BodyP>
                OAuth integrations with Google and GitHub are governed by their own privacy
                policies. When you connect a social provider, we receive only the limited
                information required for login.
              </BodyP>
            </Section>

            <Section id="s14" num="14" title="Changes to This Policy">
              <BodyP>
                We may update this policy as Imminiq grows. If changes are important, we will notify
                you through the platform, email, or another reasonable method.
              </BodyP>

              <HighlightCard label="Policy Updates" variant="amber">
                The latest version will always be available on this page with the effective date and
                last updated date clearly shown.
              </HighlightCard>
            </Section>

            <Section id="s15" num="15" title="Contact & DPO">
              <BodyP>
                For privacy questions, data requests, security concerns, or account deletion help,
                contact the Imminiq privacy team.
              </BodyP>

              <div className="rounded-md border border-(--border-subtle) bg-(--surface-card) p-5 shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-(--surface-card) dark:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(232,129,106,0.07)]">
                <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.12em] text-(--brand-500) dark:text-(--brand-500)">
                  Privacy Contact
                </div>

                <p className="mb-4 text-sm leading-[1.7] text-(--text-secondary) dark:text-(--text-secondary)">
                  Email us at <EmailLink>privacy@imminiq.com</EmailLink>. For urgent security
                  concerns, include “Security” in the subject line.
                </p>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="mailto:privacy@imminiq.com"
                    className="inline-flex items-center gap-2 rounded-md bg-(--brand-500) px-5 py-3 text-sm font-semibold text-[#f5ede4] transition hover:-translate-y-px hover:bg-(--brand-600) hover:shadow-[0_6px_20px_rgba(184,76,43,0.30)] active:translate-y-0 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
                  >
                    Contact Privacy Team
                    <IconArrowRight />
                  </a>

                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 rounded-md border-[1.5px] border-[rgba(184,76,43,0.16)] bg-transparent px-5 py-3 text-sm font-semibold text-(--brand-500) transition hover:-translate-y-px hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.05)] dark:border-[rgba(232,129,106,0.22)] dark:text-(--brand-500) dark:hover:border-(--brand-500) dark:hover:bg-[rgba(232,129,106,0.07)]"
                  >
                    Back to Register
                  </button>
                </div>
              </div>
            </Section>
          </main>
        </div>
      </div>
    </div>
  );
}

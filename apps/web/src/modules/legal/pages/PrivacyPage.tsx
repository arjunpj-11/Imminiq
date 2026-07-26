import { Link } from 'react-router';
import { ROUTES } from '../../../routes/config/route-paths';

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
  { id: 's6', num: '06', label: 'AI, Voice & Personalization' },
  { id: 's7', num: '07', label: 'Cookies & Device Storage' },
  { id: 's8', num: '08', label: 'Data Retention' },
  { id: 's9', num: '09', label: 'Security' },
  { id: 's10', num: '10', label: 'Your Rights' },
  { id: 's11', num: '11', label: "Children's Privacy" },
  { id: 's12', num: '12', label: 'International Transfers' },
  { id: 's13', num: '13', label: 'Third-Party Links' },
  { id: 's14', num: '14', label: 'Changes to Policy' },
  { id: 's15', num: '15', label: 'Contact & Grievances' },
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
              to={ROUTES.home}
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
              Privacy Policy
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
              Version 7.0.0 · July 2026
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
                Privacy Policy
              </h1>

              <p className="mb-5 max-w-150 text-[15px] leading-[1.7] text-(--text-secondary) dark:text-(--text-secondary)">
                This policy explains how Imminiq handles account, learning, community,
                communication, device-permission, and payment data—and the controls available to
                you.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                {['Effective: 26 July 2026', 'Last Updated: 26 July 2026', 'Version 7.0.0'].map(
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
                  desc: 'Protected cookies, rotated sessions, one-way password hashing, and encrypted transport.',
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
                This Privacy Policy describes how Imminiq collects, uses, stores, and shares
                information when you use our website, APIs, AI-assisted learning tools, community,
                Social, calls, and related services.
              </BodyP>

              <BodyP>
                This policy is a notice about our practices, not a request to waive your privacy
                rights. Where consent is legally required, we request it separately and you may
                withdraw it as described below.
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
                        'Goals, trackers, lessons, progress, mock tests, answers, searches, streaks',
                        'Deliver lessons, progress insights, and relevant tracker suggestions',
                      ],
                      [
                        'Community and Social data',
                        'Profiles, follows, reviews, votes, contributions, chats, starred messages, call history',
                        'Enable sharing, collaboration, moderation, and communication',
                      ],
                      [
                        'Files and media',
                        'Images, documents, voice notes, voice-typing audio, and profile media',
                        'Deliver uploads, messages, transcription, and requested media features',
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
                  'To personalize community discovery using your trackers, filters, and recent searches.',
                  'To operate profiles, publishing, cloning, contributions, reviews, likes, verification votes, rewards, messages, and calls.',
                  'To process subscriptions, payments, invoices, and support requests.',
                  'To detect abuse, prevent fraud, improve reliability, and secure the platform.',
                ]}
              />
            </Section>

            <Section id="s4" num="04" title="Legal Basis">
              <BodyP>
                Depending on where you live and the purpose involved, we process data to perform our
                contract with you, comply with law, pursue legitimate interests such as security and
                service reliability, protect users, or act on your consent.
              </BodyP>

              <HighlightCard label="Consent">
                Browser access to your microphone or camera requires a permission prompt. Public
                profile visibility and community publishing are controlled by the choices you make
                in the product. You can withdraw browser permissions from your device settings.
              </HighlightCard>
            </Section>

            <Section id="s5" num="05" title="Data Sharing">
              <BodyP>
                We do not sell your personal data. We share data only with trusted service providers
                when required to run Imminiq.
              </BodyP>

              <div className="flex flex-wrap gap-2">
                {[
                  'Cloud, database, and cache hosting',
                  'Email delivery',
                  'Payment provider',
                  'AI and transcription providers',
                  'File and media storage',
                  'Call relay infrastructure',
                  'Video and learning-resource providers',
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

            <Section id="s6" num="06" title="AI, Voice & Personalization">
              <BodyP>
                Imminiq uses AI to generate roadmaps, explanations, summaries, mock tests, and
                learning insights. Inputs may include your goals, selected domain, skill level,
                tracker structure, answers, prompts, and learning progress. Relevant content is sent
                to configured AI providers to produce the feature you request.
              </BodyP>

              <TermsList
                items={[
                  'Voice typing records audio only after you approve microphone access and sends that recording to a transcription provider. Imminiq returns the text and does not intentionally store the temporary voice-typing recording as a chat message.',
                  'Voice notes you choose to send are stored as chat attachments until deleted under the product and retention rules.',
                  'Audio and video calls use browser WebRTC. Imminiq stores call participants, type, reason, status, and duration; it does not record call media. Encrypted media may pass through a relay when a direct connection is unavailable.',
                  'Recent community searches are retained on your device and may be included with a discovery request to rank relevant public trackers. They are not used for advertising.',
                  'Do not include passwords, financial credentials, health records, or other highly sensitive information in AI prompts, voice input, chats, or public content.',
                ]}
              />

              <HighlightCard label="Daily Quota" variant="green">
                AI usage may be metered by subscription plan. We keep limited usage records to
                enforce quotas, prevent abuse, and operate the requested feature.
              </HighlightCard>
            </Section>

            <Section id="s7" num="07" title="Cookies & Device Storage">
              <BodyP>
                We use strictly necessary cookies for authentication, two-factor and OAuth flows,
                and request-forgery protection. We also use browser storage for preferences, drafts,
                recent searches, and the cookie-notice acknowledgement. We do not currently use
                advertising, behavioural-tracking, or cross-site analytics cookies.
              </BodyP>

              <div className="overflow-x-auto rounded-xl border border-(--border-subtle) dark:border-white/15">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[rgba(184,76,43,0.08)] dark:bg-[rgba(232,129,106,0.09)]">
                      {['Storage Type', 'Purpose', 'Typical Duration', 'Status'].map((heading) => (
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
                        'Encrypted HTTP-only refresh session',
                        'Configured session lifetime',
                        'Strictly necessary',
                        'rust',
                      ],
                      [
                        'Security',
                        'CSRF protection and temporary OAuth or two-factor state',
                        'Minutes to 7 days',
                        'Strictly necessary',
                        'rust',
                      ],
                      [
                        'Local and session storage',
                        'Theme, navigation state, drafts, recent searches, and notice acknowledgement',
                        'Until used, cleared, or expired',
                        'Device storage',
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
                  'Deleting an account starts the recovery period shown in Settings. After that period, account data is deleted or anonymised unless continued retention is legally required.',
                  'Chat messages, attachments, community content, votes, call history, and learning records remain while needed to provide those features or until deleted, cleared, anonymised, or no longer required.',
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
                delete, restrict, object to, or obtain a portable copy of your personal data, and to
                complain to an appropriate regulator.
              </BodyP>

              <TermsList
                variant="check"
                items={[
                  'Access a copy of your personal data.',
                  'Correct inaccurate account or profile information.',
                  'Export available account and learning data from Settings.',
                  'Delete your account and associated learning data.',
                  'Change profile visibility, notification, and communication preferences.',
                  'Withdraw consent or browser media permissions where processing depends on them.',
                  'Ask about a decision, lodge a grievance, or contact the relevant supervisory authority.',
                ]}
              />

              <HighlightCard label="Response Time" variant="green">
                We aim to acknowledge and respond within the period required by applicable law. We
                may verify your identity and may decline or charge for manifestly unfounded or
                excessive requests where the law permits.
              </HighlightCard>
            </Section>

            <Section id="s11" num="11" title="Children's Privacy">
              <BodyP>
                Imminiq is not directed to children under 13. If you are under the age of legal
                majority where you live, a parent or legal guardian must review the Terms and
                provide any consent required by applicable law.
              </BodyP>

              <BodyP>
                If we learn that we collected a child's personal data without legally valid
                authorisation, we will restrict or delete it as required. Contact us at{' '}
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
                OAuth integrations with Google and GitHub, payment checkout through Razorpay,
                recommended videos from YouTube, AI providers, and any external links are governed
                by those providers' own terms and privacy notices. For social login, we request the
                limited account information needed to authenticate and create or link your account.
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

            <Section id="s15" num="15" title="Contact & Grievances">
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
                    Back
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

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
  IconMail,
  IconShield,
  LogoIcon,
  Section,
  TermsList,
} from '../components/LegalShared';

import { cn, scrollbarClass } from '../utils/legal-ui';
import { useLegalDocumentNavigation } from '../hooks/useLegalDocumentNavigation';

const TOC = [
  { id: 's1', num: '01', label: 'Acceptance of Terms' },
  { id: 's2', num: '02', label: 'Eligibility' },
  { id: 's3', num: '03', label: 'Account Registration & Security' },
  { id: 's4', num: '04', label: 'Platform Services' },
  { id: 's5', num: '05', label: 'User Conduct & Acceptable Use' },
  { id: 's6', num: '06', label: 'Intellectual Property' },
  { id: 's7', num: '07', label: 'User-Generated Content' },
  { id: 's8', num: '08', label: 'AI Features & Limitations' },
  { id: 's9', num: '09', label: 'Subscriptions & Payments' },
  { id: 's10', num: '10', label: 'Coins, Store & Rewards' },
  { id: 's11', num: '11', label: 'Termination & Suspension' },
  { id: 's12', num: '12', label: 'Disclaimers & Warranties' },
  { id: 's13', num: '13', label: 'Limitation of Liability' },
  { id: 's14', num: '14', label: 'Governing Law & Disputes' },
  { id: 's15', num: '15', label: 'Changes to These Terms' },
  { id: 's16', num: '16', label: 'Contact Us' },
];

export default function TermsPage() {
  const { activeId, readPct, scrollAreaRef, handleBack, handleTocClick } =
    useLegalDocumentNavigation();

  return (
    <div className="h-screen overflow-hidden bg-(--surface-canvas) text-(--text-primary) font-[DM_Sans,sans-serif] dark:bg-(--surface-canvas) dark:text-(--text-primary)">
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
              Terms of Service
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
            aria-label="Terms of Service content"
          >
            <div className="pp-section mb-9">
              <div className="mb-4.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.07em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-(--brand-500)">
                <span className="h-1.25 w-1.25 animate-pulse rounded-full bg-(--brand-500) dark:bg-(--brand-500)" />
                Legal Agreement
              </div>

              <h1 className="mb-3.5 font-serif text-[clamp(30px,5vw,48px)] font-extrabold leading-[1.08] tracking-[-1px] text-(--text-primary) dark:text-(--text-primary)">
                Terms of Service
              </h1>

              <p className="mb-5 max-w-160 text-[15px] leading-[1.7] text-(--text-secondary) dark:text-(--text-secondary)">
                These terms govern your access to Imminiq—our AI-assisted learning, tracker,
                community, communication, assessment, and collaboration platform. Please read them
                carefully before creating an account.
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

            <div
              className="mb-10 flex items-start gap-3.5 rounded-xl border border-[rgba(240,165,0,0.22)] bg-[rgba(240,165,0,0.07)] px-5 py-4 dark:border-[rgba(240,168,66,0.24)] dark:bg-[rgba(240,168,66,0.08)]"
              role="note"
              aria-label="Important notice"
            >
              <div className="mt-0.5 shrink-0 text-[#f0a500] dark:text-(--warning)">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>

              <div>
                <strong className="mb-1.5 block text-[13.5px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                  Important — Please Read Before Using Imminiq
                </strong>
                <p className="text-[13px] leading-[1.65] text-(--text-secondary) dark:text-(--text-secondary)">
                  By registering an account or using any part of this platform, you agree to be
                  bound by these Terms. If you do not agree, you must not access or use Imminiq.
                  These Terms apply to all users — free, pro, and premium.
                </p>
              </div>
            </div>

            <Section id="s1" num="01" title="Acceptance of Terms">
              <BodyP>
                Welcome to Imminiq. These Terms of Service constitute a legally binding agreement
                between you and Imminiq regarding your access to and use of the Imminiq platform,
                including our website, APIs, and associated services.
              </BodyP>

              <BodyP>
                By clicking <strong>Create account</strong>, completing the registration process,
                signing in via Google or GitHub, or otherwise accessing the Platform, you
                acknowledge that you have read, understood, and agreed to these Terms and our{' '}
                <Link
                  className="font-medium text-(--brand-500) underline underline-offset-4 hover:text-[#963d22] dark:text-(--brand-500) dark:hover:text-[#f5a090]"
                  to={ROUTES.privacy}
                >
                  Privacy Policy
                </Link>
                .
              </BodyP>

              <HighlightCard label="Quick Summary">
                Using Imminiq means agreeing to these Terms. If you are registering on behalf of an
                organization, you confirm that you have the authority to bind that organization to
                these Terms.
              </HighlightCard>
            </Section>

            <Section id="s2" num="02" title="Eligibility">
              <BodyP>To use Imminiq, you must meet the following requirements:</BodyP>

              <TermsList
                items={[
                  <>
                    You must be at least <strong>13 years of age</strong>. If you are under the age
                    of legal majority where you live, your parent or legal guardian must review
                    these Terms and consent to your use where applicable law requires it.
                  </>,
                  'You must not be prohibited from using the Platform under applicable law in your jurisdiction.',
                  'You must not have had a previous account suspended or terminated by Imminiq for violations of these Terms.',
                  'If using institutional or educational access, you must comply with any additional terms established by your institution.',
                ]}
              />

              <BodyP>
                We reserve the right to verify eligibility and to refuse service, close accounts,
                and remove or edit content at our sole discretion.
              </BodyP>
            </Section>

            <Section id="s3" num="03" title="Account Registration & Security">
              <BodyP>
                To access most features of Imminiq, you must create an account. When registering,
                you agree to:
              </BodyP>

              <TermsList
                items={[
                  'Provide accurate, current, and complete information during registration, including a valid email address or phone number.',
                  'Maintain and promptly update your account information to keep it accurate and complete.',
                  'Choose a strong password and keep it confidential. You are responsible for all activity under your account.',
                  <>
                    Notify us immediately at <EmailLink>security@imminiq.com</EmailLink> if you
                    suspect any unauthorized use of your account.
                  </>,
                  'Not share your account credentials with any third party or allow others to access your account.',
                ]}
              />

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="rounded-md border border-(--border-subtle) bg-white p-4 dark:border-white/15 dark:bg-(--surface-elevated)">
                  <strong className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                    <IconShield className="text-(--brand-500) dark:text-(--brand-500)" />
                    Two-Factor Authentication
                  </strong>
                  <p className="m-0 text-[12.5px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
                    We strongly recommend enabling TOTP-based 2FA from your account settings for
                    additional security.
                  </p>
                </div>

                <div className="rounded-md border border-(--border-subtle) bg-white p-4 dark:border-white/15 dark:bg-(--surface-elevated)">
                  <strong className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                    <IconDoc className="text-(--brand-500) dark:text-(--brand-500)" />
                    One Account Per Person
                  </strong>
                  <p className="m-0 text-[12.5px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
                    Each individual may only maintain one active Imminiq account. Creating multiple
                    accounts to bypass restrictions is prohibited.
                  </p>
                </div>
              </div>
            </Section>

            <Section id="s4" num="04" title="Platform Services">
              <BodyP>
                Imminiq provides an AI-powered personalized learning platform. Our core services
                include:
              </BodyP>

              <TermsList
                variant="check"
                items={[
                  'AI-generated personalized learning roadmaps and tracker management.',
                  'Manual tracker creation with reusable or custom learning domains.',
                  'Mock test creation, AI evaluation, and performance analytics.',
                  'In-browser code practice environment with multi-language support.',
                  'Personalized community discovery, tracker publishing, cloning, reviews, contributions, and verification.',
                  'Profiles, rich sharing cards, clickable links, real-time chat, starred messages, voice notes, and file sharing.',
                  'Contextual audio and video calls, call history, supported audio-output controls, and Social tools.',
                  'Streaks, leaderboards, coins, rewards, and learning-guild challenges.',
                ]}
              />

              <BodyP>
                We reserve the right to modify, suspend, or discontinue any feature or service at
                any time, with or without notice.
              </BodyP>
            </Section>

            <Section id="s5" num="05" title="User Conduct & Acceptable Use">
              <BodyP>
                You agree to use Imminiq only for lawful, educational, and personal learning
                purposes. The following are <strong>strictly prohibited</strong>:
              </BodyP>

              <TermsList
                items={[
                  'Submitting false, misleading, or fraudulent information to the Platform or other users.',
                  'Harassing, bullying, threatening, or abusing other users through challenges, chat, or community posts.',
                  'Sharing, distributing, or uploading content that is offensive, defamatory, obscene, or illegal.',
                  'Using bots, scripts, or automation tools to interact with the Platform in an unauthorized manner.',
                  'Attempting to gain unauthorized access to accounts, systems, or restricted areas of the Platform.',
                  'Using AI features to generate or propagate misinformation, fake academic content, or plagiarized material.',
                  'Reverse engineering, decompiling, or attempting to extract source code from the Platform.',
                  'Violating any applicable local, national, or international laws or regulations.',
                  'Creating multiple accounts to manipulate leaderboards, challenges, or referral rewards.',
                ]}
              />

              <BodyP>
                Violation of these conduct rules may result in immediate account suspension,
                permanent banning, and legal action where applicable.
              </BodyP>
            </Section>

            <Section id="s6" num="06" title="Intellectual Property">
              <BodyP>
                All content on the Platform created by or on behalf of Imminiq — including platform
                design, interface elements, brand assets, AI-generated roadmap frameworks,
                proprietary algorithms, lesson structures, and documentation — is the exclusive
                property of Imminiq.
              </BodyP>

              <BodyP>
                You may not copy, reproduce, distribute, transmit, display, sell, or create
                derivative works from our proprietary content without express prior written
                permission.
              </BodyP>

              <TermsList
                items={[
                  'Viewing and using platform content for your own personal, non-commercial learning.',
                  'Cloning publicly shared community trackers for your own educational use within the Platform.',
                  'Sharing your personal learning progress, streaks, and certificates on external platforms.',
                ]}
              />

              <BodyP>
                The Imminiq name, logo, and brand identity are trademarks of Imminiq. Unauthorized
                use of our trademarks is prohibited.
              </BodyP>
            </Section>

            <Section id="s7" num="07" title="User-Generated Content">
              <BodyP>
                You may create and share content on Imminiq, including profiles, learning trackers,
                topic contributions, reviews, verification votes, chat messages, links, code,
                images, documents, and voice notes.
              </BodyP>

              <TermsList
                items={[
                  'You retain ownership of your User Content. You grant Imminiq a worldwide, non-exclusive, royalty-free licence to use, display, reproduce, and distribute your User Content solely for operating and improving the Platform.',
                  'You confirm that your User Content does not infringe upon the intellectual property rights, privacy rights, or other rights of any third party.',
                  'Imminiq may remove any User Content that violates these Terms, our Community Guidelines, or applicable law.',
                  'Public profiles and published trackers may appear in search, recommendation, and share cards. Published trackers may be cloned by other users under the Platform sharing system.',
                  'Private messages are visible to conversation participants. Clearing a chat removes eligible messages from your view while starred messages are preserved until unstarred or otherwise deleted.',
                ]}
              />

              <BodyP>
                You are solely responsible for all User Content you submit. Imminiq does not endorse
                or verify the accuracy of User Content.
              </BodyP>
            </Section>

            <Section id="s8" num="08" title="AI Features & Limitations">
              <BodyP>
                Imminiq uses third-party AI models to power features including roadmap generation,
                lesson explanations, mock test creation, code review, and performance analysis.
              </BodyP>

              <TermsList
                items={[
                  <>
                    <strong>
                      AI outputs are not guaranteed to be accurate, complete, or appropriate for all
                      use cases.
                    </strong>{' '}
                    You should verify critical information from authoritative external sources.
                  </>,
                  'AI-generated roadmaps, test questions, and lesson content are learning aids — not substitutes for professional academic advice or certified curricula.',
                  'Prompts, voice-typing audio, tracker context, and relevant learning data may be sent to configured AI or transcription providers to produce the output you request, as explained in our Privacy Policy.',
                  'AI usage is subject to daily quotas based on your subscription plan.',
                  'We reserve the right to update, change, or replace the AI models powering our features as technology evolves.',
                ]}
              />

              <HighlightCard label="Academic Integrity">
                AI features on Imminiq are designed to support learning, not to replace your own
                intellectual effort. You are responsible for how you use AI outputs outside Imminiq.
              </HighlightCard>
            </Section>

            <Section id="s9" num="09" title="Subscriptions & Payments">
              <BodyP>
                Imminiq offers Free, Pro, and Premium subscription tiers. Paid subscriptions are
                billed through our payment gateway Razorpay.
              </BodyP>

              <TermsList
                items={[
                  <>
                    <strong>Billing.</strong> Subscriptions are billed monthly or annually as
                    selected at checkout.
                  </>,
                  <>
                    <strong>Auto-renewal.</strong> Subscriptions renew automatically unless you
                    cancel before the renewal date.
                  </>,
                  <>
                    <strong>Upgrades & Downgrades.</strong> Plan changes take effect at the next
                    billing cycle unless upgrading.
                  </>,
                  <>
                    <strong>Cancellation.</strong> You may cancel at any time. Your subscription
                    remains active until the end of the current billing period.
                  </>,
                  <>
                    <strong>Refunds.</strong> Refund requests may be submitted within 7 days of an
                    initial purchase and are assessed case by case.
                  </>,
                  <>
                    <strong>Taxes.</strong> Applicable taxes may be calculated and added at checkout
                    based on your billing location.
                  </>,
                  <>
                    <strong>Failed Payments.</strong> If payment continues to fail, your
                    subscription may be downgraded to the Free tier.
                  </>,
                ]}
              />
            </Section>

            <Section id="s10" num="10" title="Coins, Store & Rewards">
              <BodyP>
                Imminiq operates an in-app virtual economy using Coins as a non-monetary reward
                currency.
              </BodyP>

              <TermsList
                items={[
                  'Coins have no real-world monetary value, cannot be exchanged for cash, and are non-transferable between accounts.',
                  'Coins are earned through legitimate platform activities such as completing subtopics, winning challenges, verifying trackers, and successful referrals.',
                  'Verification rewards are issued according to the applicable majority outcome and moderation result. Duplicate, self-dealing, or manipulated votes are not eligible.',
                  'Purchased store items, badges, and powerups are tied to your account and are non-transferable and non-refundable.',
                  'We reserve the right to modify earning rates, store catalog, and item prices at any time.',
                  'Coins obtained through exploits, bugs, or unauthorized means will be revoked and may result in account suspension.',
                  'Referral rewards are subject to verification and may be withheld if fraudulent activity is detected.',
                ]}
              />
            </Section>

            <Section id="s11" num="11" title="Termination & Suspension">
              <BodyP>Either you or Imminiq may terminate your account at any time.</BodyP>

              <BodyP>
                <strong>By you:</strong> You may delete your account at any time from Settings →
                Account → Delete Account. Deletion initiates a 30-day grace period during which your
                account is deactivated.
              </BodyP>

              <BodyP>
                <strong>By Imminiq:</strong> We may suspend or terminate your account without prior
                notice if we determine that you violated these Terms, engaged in fraudulent
                activity, or pose a risk to users or the platform.
              </BodyP>

              <TermsList
                items={[
                  'Access to all account features may be immediately revoked.',
                  'Active subscriptions may be cancelled without refund.',
                  'Accumulated Coins and store items may be forfeited.',
                  <>
                    You may appeal a suspension by contacting{' '}
                    <EmailLink>appeals@imminiq.com</EmailLink>.
                  </>,
                ]}
              />
            </Section>

            <Section id="s12" num="12" title="Disclaimers & Warranties">
              <BodyP>
                The Platform is provided on an <strong>as is</strong> and{' '}
                <strong>as available</strong> basis without warranties of any kind, either express
                or implied.
              </BodyP>

              <TermsList
                items={[
                  'Implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
                  'Warranties that the Platform will be error-free, uninterrupted, secure, or free from viruses.',
                  'Warranties regarding the accuracy, reliability, or completeness of AI-generated content.',
                  'Warranties that the Platform will meet your specific educational or professional requirements.',
                ]}
              />

              <BodyP>
                We do not warrant that learning outcomes will result from use of the Platform.
                Educational progress depends on your individual effort, consistency, and application
                of knowledge.
              </BodyP>
            </Section>

            <Section id="s13" num="13" title="Limitation of Liability">
              <BodyP>
                To the fullest extent permitted by applicable law, Imminiq and its officers,
                directors, employees, partners, and licensors shall not be liable for:
              </BodyP>

              <TermsList
                items={[
                  'Indirect, incidental, special, consequential, or punitive damages arising out of your use of the Platform.',
                  'Loss of data, profits, goodwill, or business opportunities.',
                  'Damages resulting from unauthorized access to your account due to your failure to maintain account security.',
                  'Errors, inaccuracies, or omissions in any AI-generated content or platform data.',
                ]}
              />

              <BodyP>
                Our total aggregate liability to you shall not exceed the greater of either the
                amount you paid to Imminiq in the 12 months preceding the claim, or INR 1,000.
              </BodyP>
            </Section>

            <Section id="s14" num="14" title="Governing Law & Disputes">
              <BodyP>
                These Terms are governed by and construed in accordance with the laws of India. Any
                disputes shall be subject to the exclusive jurisdiction of the competent courts
                located in Kerala, India.
              </BodyP>

              <BodyP>
                Before initiating formal legal proceedings, both parties agree to make a good-faith
                effort to resolve disputes through informal negotiation. Contact us at{' '}
                <EmailLink>legal@imminiq.com</EmailLink>.
              </BodyP>

              <HighlightCard label="Users Outside India">
                If you access Imminiq from outside India, you do so at your own risk and are
                responsible for compliance with local laws.
              </HighlightCard>
            </Section>

            <Section id="s15" num="15" title="Changes to These Terms">
              <BodyP>
                We may update these Terms from time to time to reflect changes in our services,
                legal requirements, or business practices.
              </BodyP>

              <TermsList
                items={[
                  'Update the Last Updated date at the top of this page.',
                  'Send an in-app notification and, where appropriate, an email notification to registered users.',
                  'Display a prominent notice within the Platform for a period of at least 14 days.',
                ]}
              />

              <BodyP>
                Your continued use of Imminiq after the effective date of revised Terms constitutes
                your acceptance of those changes.
              </BodyP>
            </Section>

            <Section id="s16" num="16" title="Contact Us">
              <BodyP>
                If you have any questions, concerns, or requests regarding these Terms, please reach
                out through one of the following channels:
              </BodyP>

              <div className="rounded-md border border-(--border-subtle) bg-(--surface-card) p-5 shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-(--surface-card) dark:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(232,129,106,0.07)]">
                <div className="mb-4 flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-(--brand-500)">
                    <IconMail />
                  </div>

                  <div>
                    <strong className="mb-1 block text-[13.5px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                      Legal Enquiries
                    </strong>
                    <p className="text-[13px] leading-[1.65] text-(--text-secondary) dark:text-(--text-secondary)">
                      For Terms of Service questions, legal notices, and compliance requests:{' '}
                      <EmailLink>legal@imminiq.com</EmailLink>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 border-t border-(--border-subtle) pt-4 dark:border-white/15">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-(--brand-500)">
                    <IconShield />
                  </div>

                  <div>
                    <strong className="mb-1 block text-[13.5px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                      Account & Security
                    </strong>
                    <p className="text-[13px] leading-[1.65] text-(--text-secondary) dark:text-(--text-secondary)">
                      For account access, security concerns, and suspension appeals:{' '}
                      <EmailLink>support@imminiq.com</EmailLink>
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            <div className="mt-15 rounded-xl border border-(--border-subtle) bg-(--surface-card) px-6 py-12 text-center shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-(--surface-card) dark:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(232,129,106,0.07)] sm:px-8">
              <div className="mx-auto mb-4 flex h-13 w-13 items-center justify-center rounded-md border border-[rgba(76,175,125,0.20)] bg-[rgba(76,175,125,0.07)] text-(--success) dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.08)] dark:text-(--success)">
                <IconCheck className="h-6 w-6" />
              </div>

              <h3 className="mb-2.5 font-serif text-[22px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                Ready to start learning?
              </h3>

              <p className="mx-auto mb-6 max-w-140 text-sm leading-[1.7] text-(--text-secondary) dark:text-(--text-secondary)">
                By creating your account, you confirm you have read and agree to these Terms and
                acknowledge our Privacy Policy.
              </p>

              <Link
                to={ROUTES.register}
                className="inline-flex items-center gap-2 rounded-md bg-(--brand-500) px-6 py-3 text-sm font-semibold text-[#f5ede4] transition hover:-translate-y-px hover:bg-(--brand-600) hover:shadow-[0_6px_20px_rgba(184,76,43,0.30)] active:translate-y-0 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
              >
                Create Account
                <IconArrowRight />
              </Link>
            </div>

            <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-(--border-subtle) pt-5 text-xs text-(--text-secondary) dark:border-white/15 dark:text-(--text-secondary)">
              <span>© 2026 Imminiq. Crafted for the intentional learner.</span>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <Link
                  to={ROUTES.privacy}
                  className="transition hover:text-(--brand-500) dark:hover:text-(--brand-500)"
                >
                  Privacy Policy
                </Link>
                <Link
                  to={ROUTES.terms}
                  className="transition hover:text-(--brand-500) dark:hover:text-(--brand-500)"
                >
                  Terms of Service
                </Link>
                <a
                  href="mailto:legal@imminiq.com"
                  className="transition hover:text-(--brand-500) dark:hover:text-(--brand-500)"
                >
                  Legal Contact
                </a>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

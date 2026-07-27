import {
  CheckCheck,
  ChevronDown,
  Code2,
  LockKeyhole,
  Mic,
  Phone,
  Play,
  Send,
  Share2,
  Video,
} from 'lucide-react';
import { Link } from 'react-router';

import { ROUTES } from '../../../routes/config/route-paths';
import { socialCapabilities } from '../constants/landing.constants';

const conversations = [
  {
    initials: 'AK',
    name: 'Aarav K.',
    preview: 'That roadmap is exactly what I needed.',
    tone: '#6b9fe8',
  },
  { initials: 'MS', name: 'Maya S.', preview: 'Voice message · 0:18', tone: '#e8816a' },
  {
    initials: 'JG',
    name: 'JavaScript Guild',
    preview: '3 new tracker contributions',
    tone: '#84a98c',
  },
];

export default function SocialPreview() {
  return (
    <section
      id="social"
      className="render-lazy-section bg-[#f5ede4] px-4 py-16 text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb] sm:px-8 sm:py-20 lg:px-10"
    >
      <div className="mx-auto max-w-340">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-[0.2em] text-[#b84c2b] dark:text-[#e8816a]">
              Imminiq Social
            </p>
            <h2 className="mt-5 max-w-220 font-['Playfair_Display',serif] text-[clamp(44px,7vw,96px)] font-black leading-[0.9] tracking-[-0.075em]">
              Learning continues between lessons.
            </h2>
          </div>

          <div className="lg:pb-2">
            <p className="max-w-150 text-[16px] leading-[1.7] text-[#6b5f58] dark:text-[#b8b4aa]">
              A focused place to talk with friends, share what you are learning, and jump into a
              call when a message is not enough—all without leaving Imminiq.
            </p>
            <Link
              to={ROUTES.register}
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#b84c2b] px-6 py-3 text-[13px] font-extrabold text-[#fdf8f5] no-underline transition hover:-translate-y-1 hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#f09a84]"
            >
              Start learning together
              <Send aria-hidden="true" size={15} strokeWidth={2.4} />
            </Link>
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-[34px] border border-[#e0d0c5] bg-[#fdf8f5] text-[#1a1714] shadow-[0_28px_90px_rgba(26,23,20,0.12)] dark:border-white/10 dark:bg-[#080807] dark:text-[#f2f0eb] dark:shadow-[0_40px_120px_rgba(0,0,0,0.42)]">
          <div className="flex items-center justify-between border-b border-[#e0d0c5] bg-[#f5ede4] px-5 py-4 dark:border-white/8 dark:bg-white/3 sm:px-7">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#d5a857]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#84a98c]" />
            </div>
            <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.18em] text-[#6b5f58] dark:text-white/42">
              Private by design · Live when you need it
            </span>
          </div>

          <div
            className="grid min-h-135 md:grid-cols-[minmax(220px,0.36fr)_minmax(0,1fr)]"
            aria-label="Preview of the Imminiq Social conversation experience"
          >
            <aside className="hidden border-r border-[#e0d0c5] bg-[#fcf6f0] p-4 dark:border-white/8 dark:bg-[#11110f] md:block">
              <div className="flex items-center justify-between px-2 pb-5 pt-1">
                <div>
                  <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.17em] text-[#b84c2b] dark:text-[#e8816a]">
                    Social
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">Conversations</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b84c2b] text-[#fdf8f5] dark:bg-[#e8816a] dark:text-[#141412]">
                  <Send aria-hidden="true" size={15} />
                </div>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#b84c2b] px-3 py-2 text-center text-[11px] font-bold text-[#fdf8f5] dark:bg-[#e8816a] dark:text-[#141412]">
                  Chats
                </div>
                <div className="rounded-xl border border-[#e0d0c5] px-3 py-2 text-center text-[11px] font-bold text-[#6b5f58] dark:border-white/8 dark:text-white/58">
                  Friends
                </div>
              </div>

              <div className="space-y-2">
                {conversations.map((conversation, index) => (
                  <div
                    key={conversation.name}
                    className={`flex items-center gap-3 rounded-2xl border p-3 ${
                      index === 0
                        ? 'border-[#b84c2b]/30 bg-[#b84c2b]/10 dark:border-[#e8816a]/30 dark:bg-[#e8816a]/10'
                        : 'border-transparent bg-[#f5ede4]/60 dark:bg-white/3'
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-[#141412]"
                      style={{ backgroundColor: conversation.tone }}
                    >
                      {conversation.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">{conversation.name}</p>
                      <p className="mt-1 truncate text-[10px] text-[#6b5f58] dark:text-white/45">
                        {conversation.preview}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <div className="flex min-w-0 flex-col bg-[radial-gradient(circle_at_80%_0%,rgba(184,76,43,0.06),transparent_35%),linear-gradient(180deg,#faf5f0,#f5ede4)] dark:bg-[radial-gradient(circle_at_80%_0%,rgba(232,129,106,0.10),transparent_35%),linear-gradient(180deg,#151411,#0f0e0c)]">
              <header className="flex min-h-18 items-center justify-between border-b border-[#e0d0c5] px-4 dark:border-white/8 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6b9fe8] text-[11px] font-black text-[#141412]">
                    AK
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">Aarav K.</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#2d6a47] dark:text-[#84a98c]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2d6a47] dark:bg-[#84a98c]" />
                      online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {[Phone, Video].map((Icon, index) => (
                    <div
                      key={index}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58] dark:border-white/10 dark:bg-white/4 dark:text-white/70"
                    >
                      <Icon aria-hidden="true" size={15} />
                    </div>
                  ))}
                  <div className="hidden h-9 items-center gap-2 rounded-xl border border-[#e0d0c5] bg-[#fdf8f5] px-3 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#6b5f58] dark:border-white/10 dark:bg-white/4 dark:text-white/48 sm:flex">
                    <LockKeyhole aria-hidden="true" size={12} />
                    privacy
                  </div>
                </div>
              </header>

              <div className="flex-1 space-y-4 px-4 py-6 sm:px-7">
                <div className="mx-auto w-fit rounded-full border border-[#e0d0c5] bg-[#fdf8f5] px-3 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.16em] text-[#6b5f58] dark:border-white/8 dark:bg-white/4 dark:text-white/42">
                  Today
                </div>

                <div className="max-w-[82%] rounded-[20px_20px_20px_6px] border border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-sm dark:border-white/8 dark:bg-white/6 dark:shadow-none sm:max-w-[68%]">
                  <p className="text-[12px] leading-[1.55] text-[#1a1714] dark:text-white/82">
                    I published the system-design tracker. Want to review the caching section
                    together?
                  </p>
                  <p className="mt-2 text-right font-['DM_Mono',monospace] text-[8px] text-[#8c827a] dark:text-white/32">
                    10:42
                  </p>
                </div>

                <div className="ml-auto max-w-[88%] rounded-[20px_20px_6px_20px] bg-[#b84c2b] p-4 text-[#fdf8f5] dark:bg-[#e8816a] dark:text-[#141412] sm:max-w-[72%]">
                  <div className="rounded-2xl border border-white/20 bg-black/10 dark:border-[#141412]/12 dark:bg-[#141412]/8 p-3">
                    <div className="flex items-center justify-between gap-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fdf8f5] text-[#b84c2b] dark:bg-[#141412] dark:text-[#e8816a]">
                          <Share2 aria-hidden="true" size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-['DM_Mono',monospace] text-[8px] font-bold uppercase tracking-[0.12em] opacity-75 dark:opacity-60">
                            Public tracker
                          </p>
                          <p className="mt-1 truncate text-[12px] font-extrabold">
                            System Design Foundations
                          </p>
                        </div>
                      </div>
                      <ChevronDown aria-hidden="true" className="shrink-0 opacity-75 dark:opacity-55" size={15} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-1 font-['DM_Mono',monospace] text-[8px] opacity-75 dark:opacity-55">
                    10:44 <CheckCheck aria-hidden="true" size={12} />
                  </div>
                </div>

                <div className="ml-auto flex w-[min(86%,330px)] items-center gap-3 rounded-[20px_20px_6px_20px] bg-[#b84c2b] p-3 text-[#fdf8f5] dark:bg-[#e8816a] dark:text-[#141412]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fdf8f5] text-[#b84c2b] dark:bg-[#141412] dark:text-[#e8816a]">
                    <Play aria-hidden="true" className="ml-0.5" fill="currentColor" size={14} />
                  </div>
                  <div className="flex flex-1 items-center gap-1">
                    {[8, 14, 20, 11, 25, 17, 9, 21, 14, 7, 18, 12, 22, 9].map((height, index) => (
                      <span
                        key={index}
                        className="w-1 flex-1 rounded-full bg-[#fdf8f5]/65 dark:bg-[#141412]/55"
                        style={{ height }}
                      />
                    ))}
                  </div>
                  <span className="font-['DM_Mono',monospace] text-[9px] font-bold">0:18</span>
                </div>

                <div className="max-w-[90%] overflow-hidden rounded-[20px_20px_20px_6px] border border-[#e0d0c5] bg-[#fdf8f5] dark:border-white/8 dark:bg-[#080807] sm:max-w-[76%]">
                  <div className="flex items-center justify-between border-b border-[#e0d0c5] px-4 py-2 dark:border-white/8">
                    <span className="flex items-center gap-2 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.13em] text-[#3b6cb7] dark:text-[#6b9fe8]">
                      <Code2 aria-hidden="true" size={12} />
                      cache.ts
                    </span>
                    <span className="text-[9px] font-bold text-[#6b5f58] dark:text-white/46">Copy</span>
                  </div>
                  <pre className="overflow-hidden p-4 font-['DM_Mono',monospace] text-[9px] leading-[1.7] text-[#1a1714] dark:text-white/62">
                    <code>{`const value = await cache.get(key)\nreturn value ?? loadFresh()`}</code>
                  </pre>
                </div>
              </div>

              <div className="border-t border-[#e0d0c5] p-3 dark:border-white/8 sm:p-4">
                <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] px-3 dark:border-white/10 dark:bg-white/5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f5ede4] text-[#6b5f58] dark:bg-white/7 dark:text-white/55">
                    <Mic aria-hidden="true" size={14} />
                  </div>
                  <span className="flex-1 text-[11px] text-[#8c827a] dark:text-white/32">Message Aarav...</span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#b84c2b] text-[#fdf8f5] dark:bg-[#e8816a] dark:text-[#141412]">
                    <Send aria-hidden="true" size={14} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {socialCapabilities.map((capability, index) => (
            <article
              key={capability.title}
              className="rounded-3xl border border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_16px_54px_rgba(26,23,20,0.08)] dark:border-white/9 dark:bg-white/4 dark:shadow-none"
            >
              <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.17em] text-[#b84c2b] dark:text-[#e8816a]">
                0{index + 1}
              </span>
              <h3 className="mt-5 font-['Playfair_Display',serif] text-2xl font-extrabold tracking-[-0.035em] text-[#1a1714] dark:text-[#f2f0eb]">
                {capability.title}
              </h3>
              <p className="mt-3 text-[13px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">{capability.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

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
import { Link } from 'react-router-dom';

import { ROUTES } from '../../../routes/config/route-paths';
import { socialCapabilities } from '../constants/landing.constants';

const conversations = [
  { initials: 'AK', name: 'Aarav K.', preview: 'That roadmap is exactly what I needed.', tone: '#6b9fe8' },
  { initials: 'MS', name: 'Maya S.', preview: 'Voice message · 0:18', tone: '#e8816a' },
  { initials: 'JG', name: 'JavaScript Guild', preview: '3 new tracker contributions', tone: '#84a98c' },
];

export default function SocialPreview() {
  return (
    <section
      id="social"
      className="render-lazy-section bg-[#141412] px-4 py-16 text-[#f2f0eb] sm:px-8 sm:py-20 lg:px-10"
    >
      <div className="mx-auto max-w-340">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8816a]">
              Imminiq Social
            </p>
            <h2 className="mt-5 max-w-220 font-['Playfair_Display',serif] text-[clamp(44px,7vw,96px)] font-black leading-[0.9] tracking-[-0.075em]">
              Learning continues between lessons.
            </h2>
          </div>

          <div className="lg:pb-2">
            <p className="max-w-150 text-[16px] leading-[1.7] text-[#b8b4aa]">
              A focused place to talk with friends, share what you are learning, and jump into a
              call when a message is not enough—all without leaving Imminiq.
            </p>
            <Link
              to={ROUTES.register}
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#e8816a] px-6 py-3 text-[13px] font-extrabold text-[#141412] no-underline transition hover:-translate-y-1 hover:bg-[#f09a84]"
            >
              Start learning together
              <Send aria-hidden="true" size={15} strokeWidth={2.4} />
            </Link>
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-[34px] border border-white/10 bg-[#080807] shadow-[0_40px_120px_rgba(0,0,0,0.42)]">
          <div className="flex items-center justify-between border-b border-white/8 bg-white/3 px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e8816a]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#d5a857]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#84a98c]" />
            </div>
            <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.18em] text-white/42">
              Private by design · Live when you need it
            </span>
          </div>

          <div
            className="grid min-h-135 md:grid-cols-[minmax(220px,0.36fr)_minmax(0,1fr)]"
            aria-label="Preview of the Imminiq Social conversation experience"
          >
            <aside className="hidden border-r border-white/8 bg-[#11110f] p-4 md:block">
              <div className="flex items-center justify-between px-2 pb-5 pt-1">
                <div>
                  <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.17em] text-[#e8816a]">
                    Social
                  </p>
                  <p className="mt-1 text-xl font-extrabold">Conversations</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8816a] text-[#141412]">
                  <Send aria-hidden="true" size={15} />
                </div>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#e8816a] px-3 py-2 text-center text-[11px] font-bold text-[#141412]">
                  Chats
                </div>
                <div className="rounded-xl border border-white/8 px-3 py-2 text-center text-[11px] font-bold text-white/58">
                  Friends
                </div>
              </div>

              <div className="space-y-2">
                {conversations.map((conversation, index) => (
                  <div
                    key={conversation.name}
                    className={`flex items-center gap-3 rounded-2xl border p-3 ${
                      index === 0
                        ? 'border-[#e8816a]/30 bg-[#e8816a]/10'
                        : 'border-transparent bg-white/3'
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-[#141412]"
                      style={{ backgroundColor: conversation.tone }}
                    >
                      {conversation.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-bold">{conversation.name}</p>
                      <p className="mt-1 truncate text-[10px] text-white/45">
                        {conversation.preview}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <div className="flex min-w-0 flex-col bg-[radial-gradient(circle_at_80%_0%,rgba(232,129,106,0.10),transparent_35%),linear-gradient(180deg,#151411,#0f0e0c)]">
              <header className="flex min-h-18 items-center justify-between border-b border-white/8 px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6b9fe8] text-[11px] font-black text-[#141412]">
                    AK
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-extrabold">Aarav K.</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#84a98c]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#84a98c]" />
                      online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {[Phone, Video].map((Icon, index) => (
                    <div
                      key={index}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-white/70"
                    >
                      <Icon aria-hidden="true" size={15} />
                    </div>
                  ))}
                  <div className="hidden h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-3 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-white/48 sm:flex">
                    <LockKeyhole aria-hidden="true" size={12} />
                    privacy
                  </div>
                </div>
              </header>

              <div className="flex-1 space-y-4 px-4 py-6 sm:px-7">
                <div className="mx-auto w-fit rounded-full border border-white/8 bg-white/4 px-3 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.16em] text-white/42">
                  Today
                </div>

                <div className="max-w-[82%] rounded-[20px_20px_20px_6px] border border-white/8 bg-white/6 p-4 sm:max-w-[68%]">
                  <p className="text-[12px] leading-[1.55] text-white/82">
                    I published the system-design tracker. Want to review the caching section
                    together?
                  </p>
                  <p className="mt-2 text-right font-['DM_Mono',monospace] text-[8px] text-white/32">
                    10:42
                  </p>
                </div>

                <div className="ml-auto max-w-[88%] rounded-[20px_20px_6px_20px] bg-[#e8816a] p-4 text-[#141412] sm:max-w-[72%]">
                  <div className="rounded-2xl border border-[#141412]/12 bg-[#141412]/8 p-3">
                    <div className="flex items-center justify-between gap-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#141412] text-[#e8816a]">
                          <Share2 aria-hidden="true" size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-['DM_Mono',monospace] text-[8px] font-bold uppercase tracking-[0.12em] opacity-60">
                            Public tracker
                          </p>
                          <p className="mt-1 truncate text-[12px] font-extrabold">
                            System Design Foundations
                          </p>
                        </div>
                      </div>
                      <ChevronDown aria-hidden="true" className="shrink-0 opacity-55" size={15} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-1 font-['DM_Mono',monospace] text-[8px] opacity-55">
                    10:44 <CheckCheck aria-hidden="true" size={12} />
                  </div>
                </div>

                <div className="ml-auto flex w-[min(86%,330px)] items-center gap-3 rounded-[20px_20px_6px_20px] bg-[#e8816a] p-3 text-[#141412]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#141412] text-[#e8816a]">
                    <Play aria-hidden="true" className="ml-0.5" fill="currentColor" size={14} />
                  </div>
                  <div className="flex flex-1 items-center gap-1">
                    {[8, 14, 20, 11, 25, 17, 9, 21, 14, 7, 18, 12, 22, 9].map(
                      (height, index) => (
                        <span
                          key={index}
                          className="w-1 flex-1 rounded-full bg-[#141412]/55"
                          style={{ height }}
                        />
                      )
                    )}
                  </div>
                  <span className="font-['DM_Mono',monospace] text-[9px] font-bold">0:18</span>
                </div>

                <div className="max-w-[90%] overflow-hidden rounded-[20px_20px_20px_6px] border border-white/8 bg-[#080807] sm:max-w-[76%]">
                  <div className="flex items-center justify-between border-b border-white/8 px-4 py-2">
                    <span className="flex items-center gap-2 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.13em] text-[#6b9fe8]">
                      <Code2 aria-hidden="true" size={12} />
                      cache.ts
                    </span>
                    <span className="text-[9px] font-bold text-white/46">Copy</span>
                  </div>
                  <pre className="overflow-hidden p-4 font-['DM_Mono',monospace] text-[9px] leading-[1.7] text-white/62">
                    <code>{`const value = await cache.get(key)\nreturn value ?? loadFresh()`}</code>
                  </pre>
                </div>
              </div>

              <div className="border-t border-white/8 p-3 sm:p-4">
                <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/7 text-white/55">
                    <Mic aria-hidden="true" size={14} />
                  </div>
                  <span className="flex-1 text-[11px] text-white/32">Message Aarav...</span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#e8816a] text-[#141412]">
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
              className="rounded-3xl border border-white/9 bg-white/4 p-6"
            >
              <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.17em] text-[#e8816a]">
                0{index + 1}
              </span>
              <h3 className="mt-5 font-['Playfair_Display',serif] text-2xl font-extrabold tracking-[-0.035em]">
                {capability.title}
              </h3>
              <p className="mt-3 text-[13px] leading-[1.65] text-[#9b9a92]">{capability.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

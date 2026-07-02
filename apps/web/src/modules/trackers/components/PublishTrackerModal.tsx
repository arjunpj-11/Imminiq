import { useEffect, useRef, useState } from 'react'

import { cn } from '../../../lib/cn'
import type { Tracker } from '../types/tracker.types'

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M11.5 3.5L3.5 11.5M3.5 3.5L11.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const SpinnerIcon = () => (
  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
  </svg>
)

export type PublishFormData = {
  name: string
  description: string
  domain: string
  difficulty: string
  tags: string
  allowClone: boolean
}

type PublishModalProps = {
  tracker: Tracker
  isPublishing: boolean
  publishError: string | null
  onClose: () => void
  onConfirm: (trackerId: string, data: PublishFormData) => Promise<void> | void
}

type ToggleSwitchProps = {
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
  id?: string
}

function ToggleSwitch({ checked, disabled = false, onChange, id }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => { if (!disabled) onChange(!checked) }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        width: '44px',
        height: '24px',
        borderRadius: '9999px',
        border: 'none',
        padding: '0',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        outline: 'none',
        transition: 'background-color 0.2s ease',
        backgroundColor: checked ? '#b84c2b' : 'rgba(26,23,20,0.15)',
        boxShadow: checked ? '0 0 0 3px rgba(184,76,43,0.18)' : '0 0 0 0px transparent',
        position: 'relative',
      }}
    >
      <span
        style={{
          display: 'block',
          width: '18px',
          height: '18px',
          borderRadius: '9999px',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.20)',
          transform: checked ? 'translateX(23px)' : 'translateX(3px)',
          transition: 'transform 0.2s ease',
          pointerEvents: 'none',
        }}
      />
    </button>
  )
}

const fieldLabel =
  'mb-1.5 block font-["DM_Mono",monospace] text-[9.5px] uppercase tracking-[0.13em] text-[#6b5f58] dark:text-[#9b9a92]'

const fieldInput =
  'w-full rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-white px-3.5 py-2.5 text-[13px] text-[#1a1714] placeholder:text-[#c0b8b0] transition-all duration-150 focus:border-[#b84c2b] focus:outline-none focus:ring-2 focus:ring-[rgba(184,76,43,0.14)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/9 dark:bg-[#26231f] dark:text-[#f2f0eb] dark:placeholder:text-[#504840] dark:focus:border-[#e8816a] dark:focus:ring-[rgba(232,129,106,0.16)]'

const DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

type DifficultyPickerProps = {
  value: string
  disabled?: boolean
  onChange: (v: string) => void
}

function DifficultyPicker({ value, disabled = false, onChange }: DifficultyPickerProps) {
  return (
    <div className="flex gap-2">
      {DIFFICULTIES.map((d) => (
        <button
          key={d.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(d.value)}
          className={cn(
            'flex-1 rounded-lg border-[1.5px] py-2 text-[11px] font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60',
            value === d.value
              ? 'border-[#b84c2b] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[#e8816a] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]'
              : 'border-[#e0d0c5] bg-transparent text-[#6b5f58] hover:border-[rgba(184,76,43,0.30)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:border-[rgba(232,129,106,0.30)] dark:hover:text-[#e8816a]',
          )}
        >
          {d.label}
        </button>
      ))}
    </div>
  )
}

export default function PublishTrackerModal({ tracker, isPublishing, publishError, onClose, onConfirm }: PublishModalProps) {
  const [form, setForm] = useState<PublishFormData>({
    name: tracker.title ?? '',
    description: tracker.description ?? tracker.goal ?? '',
    domain: tracker.domain ?? '',
    difficulty: 'intermediate',
    tags: '',
    allowClone: true,
  })

  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPublishing) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isPublishing, onClose])

  const setField =
    (field: keyof PublishFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const isValid = form.name.trim().length > 0 && form.domain.trim().length > 0

  const handleSubmit = async () => {
    if (!isValid || isPublishing) return
    await onConfirm(tracker._id, {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      domain: form.domain.trim(),
      difficulty: form.difficulty.trim(),
      tags: form.tags.trim(),
    })
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current && !isPublishing) onClose() }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[92dvh] overflow-y-auto rounded-t-3xl border-t border-x border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_-8px_48px_rgba(26,23,20,0.18)] sm:max-h-none sm:max-w-125 sm:rounded-[22px] sm:border-[1.5px] sm:shadow-[0_24px_72px_rgba(26,23,20,0.24)] dark:border-white/9 dark:bg-[#1e1c19]"
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-[#e0d0c5] dark:bg-white/15" />
        </div>

        <div className="px-6 pb-6 pt-4 sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-0.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor" aria-hidden="true"><circle cx="3" cy="3" r="3" /></svg>
                Publishing
              </div>
              <h2 id="publish-modal-title" className="font-['Playfair_Display',serif] text-[22px] font-extrabold leading-[1.15] tracking-[-0.4px] text-[#1a1714] dark:text-[#f2f0eb]">
                Share your tracker
              </h2>
              <p className="mt-1 text-[12px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
                Fill in the details so others can discover and learn from your roadmap.
              </p>
            </div>
            <button type="button" disabled={isPublishing} onClick={onClose} aria-label="Close publish modal" className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-[#6b5f58] transition hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#9b9a92] dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-[#e8816a]">
              <CloseIcon />
            </button>
          </div>

          <div className="mb-1 flex items-center gap-2">
            <span className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.16em] text-[#b84c2b] dark:text-[#e8816a]">01</span>
            <span className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.16em] text-[#6b5f58] dark:text-[#9b9a92]">Basic info</span>
            <div className="h-px flex-1 bg-[#e0d0c5] dark:bg-white/9" />
          </div>

          <div className="mb-4 mt-3 space-y-4">
            <div>
              <label htmlFor="publish-name" className={fieldLabel}>Tracker name <span className="text-[#b84c2b]">*</span></label>
              <input id="publish-name" type="text" value={form.name} disabled={isPublishing} onChange={setField('name')} placeholder="e.g. DSA Mastery — Striver Sheet" required className={fieldInput} />
            </div>
            <div>
              <label htmlFor="publish-description" className={fieldLabel}>Description</label>
              <textarea id="publish-description" value={form.description} disabled={isPublishing} onChange={setField('description')} rows={3} placeholder="What will learners gain from this tracker?" className={cn(fieldInput, 'resize-none leading-relaxed')} />
            </div>
          </div>

          <div className="mb-1 flex items-center gap-2">
            <span className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.16em] text-[#b84c2b] dark:text-[#e8816a]">02</span>
            <span className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.16em] text-[#6b5f58] dark:text-[#9b9a92]">Categorise</span>
            <div className="h-px flex-1 bg-[#e0d0c5] dark:bg-white/9" />
          </div>

          <div className="mb-4 mt-3 space-y-4">
            <div>
              <label htmlFor="publish-domain" className={fieldLabel}>Domain <span className="text-[#b84c2b]">*</span></label>
              <div className="relative">
                <select id="publish-domain" value={form.domain} disabled={isPublishing} onChange={setField('domain')} className={cn(fieldInput, 'appearance-none pr-9')}>
                  <option value="">Select a domain</option>
                  <option value="computer_science">Computer Science</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="biology">Biology</option>
                  <option value="history">History</option>
                  <option value="language">Language</option>
                  <option value="other">Other</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6b5f58] dark:text-[#9b9a92]" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div>
              <p className={cn(fieldLabel, 'mb-2')}>Difficulty level</p>
              <DifficultyPicker value={form.difficulty} disabled={isPublishing} onChange={(v) => setForm((prev) => ({ ...prev, difficulty: v }))} />
            </div>
            <div>
              <label htmlFor="publish-tags" className={fieldLabel}>
                Tags <span className="normal-case font-normal tracking-normal opacity-60">— comma separated</span>
              </label>
              <input id="publish-tags" type="text" value={form.tags} disabled={isPublishing} onChange={setField('tags')} placeholder="algorithms, coding, interview-prep" className={fieldInput} />
            </div>
          </div>

          <div className="mb-1 flex items-center gap-2">
            <span className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.16em] text-[#b84c2b] dark:text-[#e8816a]">03</span>
            <span className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.16em] text-[#6b5f58] dark:text-[#9b9a92]">Visibility</span>
            <div className="h-px flex-1 bg-[#e0d0c5] dark:bg-white/9" />
          </div>

          <div className="mt-3 mb-4 rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-white/60 p-4 dark:border-white/9 dark:bg-white/3">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold leading-tight text-[#1a1714] dark:text-[#f2f0eb]">Allow others to clone</p>
                <p className="mt-1 text-[11.5px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">Learners can copy this tracker to their own account and customise it.</p>
              </div>
              <ToggleSwitch checked={form.allowClone} disabled={isPublishing} onChange={(v) => setForm((prev) => ({ ...prev, allowClone: v }))} />
            </div>
            {!form.allowClone && (
              <p className="mt-3 rounded-lg border border-[rgba(138,98,0,0.22)] bg-[rgba(138,98,0,0.06)] px-3 py-2 text-[11px] leading-normal text-[#8a6200] dark:border-[rgba(240,168,66,0.20)] dark:bg-[rgba(240,168,66,0.06)] dark:text-[#f0a842]">
                Your tracker will be public but read-only — learners can view it but not clone it.
              </p>
            )}
          </div>

          {publishError && (
            <div className="mb-4 rounded-[10px] border border-[rgba(200,50,50,0.22)] bg-[rgba(200,50,50,0.08)] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#b83232] dark:border-[rgba(255,120,120,0.20)] dark:bg-[rgba(255,120,120,0.08)] dark:text-[#ff8c8c]">
              {publishError}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-[#e0d0c5] pt-5 dark:border-white/9">
            <p className="text-[11px] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]">
              <span className="text-[#b84c2b]">*</span> required fields
            </p>
            <div className="flex items-center gap-2.5">
              <button type="button" disabled={isPublishing} onClick={onClose} className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2.5 text-[12.5px] font-semibold text-[#6b5f58] transition hover:bg-[rgba(26,23,20,0.05)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/9 dark:text-[#9b9a92] dark:hover:bg-white/5">
                Cancel
              </button>
              <button type="button" disabled={!isValid || isPublishing} onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-[10px] bg-[#b84c2b] px-5 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-[#9a3e23] hover:shadow-[0_6px_20px_rgba(184,76,43,0.30)] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]">
                {isPublishing ? (
                  <><SpinnerIcon />Publishing...</>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                      <path d="M6.5 1L11.5 6.5L6.5 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M1.5 6.5H11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                    Publish tracker
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


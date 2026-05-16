import type { ReactNode } from 'react'
import type { ToastTone } from './useSettingsToast'

import {
  cn,
} from '../utils/settingsUi.utils'


export function SettingsCard({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]',
        className
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(184,76,43,0.09)] text-[18px] dark:bg-[rgba(232,129,106,0.12)]">
            {icon}
          </div>
        )}

        <div>
          <h2 className="font-['Playfair_Display',serif] text-[20px] font-extrabold tracking-[-0.35px] text-[#1a1714] dark:text-[#f2f0eb]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 max-w-3xl text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  )
}

export function MonoLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.16em] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]">
      {children}
    </div>
  )
}

export function ToggleRow({
  title,
  description,
  checked,
  onChange,
  code,
  disabled = false,
}: {
  title: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  code?: string
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-t border-[#e0d0c5] py-4 first:border-t-0 dark:border-white/9">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-[14px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
            {title}
          </div>

          {code && (
            <span className="rounded-full bg-[rgba(184,76,43,0.08)] px-2 py-0.5 font-['DM_Mono',monospace] text-[9px] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.12)] dark:text-[#e8816a]">
              {code}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-1 text-[12.5px] leading-[1.55] text-[#6b5f58] dark:text-[#9b9a92]">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition',
          checked
            ? 'bg-[#b84c2b] dark:bg-[#e8816a]'
            : 'bg-[#d5c8be] dark:bg-[#3a3530]',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        aria-pressed={checked}
      >
        <span
          className={cn(
            'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition',
            checked ? 'left-6' : 'left-1'
          )}
        />
      </button>
    </div>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
}) {
  return (
    <label className="block">
      <MonoLabel>{label}</MonoLabel>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[11px] border-[1.5px] border-[#e0d0c5] bg-white px-3.5 py-3 text-[13px] font-medium text-[#1a1714] outline-none transition focus:border-[#b84c2b] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] dark:border-white/9 dark:bg-[#252320] dark:text-[#f2f0eb] dark:focus:border-[#e8816a]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <MonoLabel>{label}</MonoLabel>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[11px] border-[1.5px] border-[#e0d0c5] bg-white px-3.5 py-3 text-[13px] font-medium text-[#1a1714] outline-none transition placeholder:text-[#9f8f86] focus:border-[#b84c2b] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] dark:border-white/9 dark:bg-[#252320] dark:text-[#f2f0eb] dark:placeholder:text-[#7a756e] dark:focus:border-[#e8816a]"
      />
    </label>
  )
}

export function PillButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border-[1.5px] px-4 py-2 text-[12.5px] font-semibold transition',
        active
          ? 'border-[rgba(184,76,43,0.24)] bg-[rgba(184,76,43,0.10)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.28)] dark:bg-[rgba(232,129,106,0.12)] dark:text-[#e8816a]'
          : 'border-[#e0d0c5] text-[#6b5f58] hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92]'
      )}
    >
      {children}
    </button>
  )
}

export function SaveBar({
  isSaving,
  onSave,
  onReset,
  saveLabel = 'Save Changes',
}: {
  isSaving?: boolean
  onSave: () => void
  onReset?: () => void
  saveLabel?: string
}) {
  return (
    <div className="sticky bottom-0 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5]/95 px-5 py-4 shadow-[0_-8px_28px_rgba(26,23,20,0.08)] backdrop-blur dark:border-white/9 dark:bg-[#1e1c19]/95">
      <p className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">
        Changes are saved to your Imminiq settings profile.
      </p>

      <div className="flex items-center gap-2">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2.5 text-[13px] font-semibold text-[#6b5f58] transition hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92]"
          >
            Reset
          </button>
        )}

        <button
          type="button"
          disabled={isSaving}
          onClick={onSave}
          className="rounded-[10px] bg-[#b84c2b] px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
        >
          {isSaving ? 'Saving...' : saveLabel}
        </button>
      </div>
    </div>
  )
}

export function SettingsToast({
  visible,
  message,
  tone,
}: {
  visible: boolean
  message: string
  tone: ToastTone
}) {
  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-130 rounded-[14px] border px-4 py-3 text-[13px] font-semibold shadow-[0_16px_50px_rgba(0,0,0,0.22)] transition duration-300',
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0',
        tone === 'success' &&
          'border-[rgba(45,106,71,0.22)] bg-[#edf8f2] text-[#2d6a47] dark:bg-[#18251e] dark:text-[#5cc98a]',
        tone === 'error' &&
          'border-[rgba(196,60,60,0.22)] bg-[#fff0f0] text-[#c43c3c] dark:bg-[#2b1818] dark:text-[#e05252]',
        tone === 'loading' &&
          'border-[rgba(59,108,183,0.22)] bg-[#eef5ff] text-[#3b6cb7] dark:bg-[#162131] dark:text-[#6b9fe8]',
        tone === 'info' &&
          'border-[#e0d0c5] bg-[#fdf8f5] text-[#1a1714] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb]'
      )}
    >
      {message}
    </div>
  )
}
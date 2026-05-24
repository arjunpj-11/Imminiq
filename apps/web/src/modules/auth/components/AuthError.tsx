import { AlertIcon, WarningIcon } from './icons/AuthIcons'
import { cn } from '../utils/auth-ui'

export function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] leading-normal text-[#d94535] dark:text-[#ff6b5f]">
      <AlertIcon />
      {message}
    </p>
  )
}

export function ApiErrorBanner({ message, warning = false }: { message?: string; warning?: boolean }) {
  if (!message) return null

  const Icon = warning ? WarningIcon : AlertIcon

  return (
    <div
      className={cn(
        'mb-4 flex items-start gap-2 rounded-[11px] border px-3 py-2.5 text-[12px] leading-normal',
        warning
          ? 'border-[rgba(201,128,0,0.26)] bg-[rgba(201,128,0,0.08)] text-[#8a6200] dark:border-[rgba(240,168,66,0.28)] dark:bg-[rgba(240,168,66,0.10)] dark:text-[#f0a842]'
          : 'border-[rgba(217,69,53,0.22)] bg-[rgba(217,69,53,0.08)] text-[#d94535] dark:border-[rgba(255,107,95,0.26)] dark:bg-[rgba(255,107,95,0.10)] dark:text-[#ff6b5f]'
      )}
      role="alert"
    >
      <Icon className="mt-0.5" />
      <span>{message}</span>
    </div>
  )
}

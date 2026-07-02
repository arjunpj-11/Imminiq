import Modal from '../../../../components/overlays/Modal'
import type { TwoFactorSetupResponse } from '../../types/settings.types'
import { MonoLabel, TextField } from '../SettingsUi'

export function InlineSecurityError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-[rgba(196,60,60,0.24)] bg-[rgba(196,60,60,0.08)] px-3.5 py-2.5 text-[12.5px] font-semibold leading-[1.55] text-[#c43c3c] dark:text-[#e05252]"
    >
      {message}
    </div>
  )
}

interface TwoFactorSetupDialogProps {
  open: boolean
  data: TwoFactorSetupResponse | null
  backupCodes: string[]
  token: string
  error: string
  isVerifying: boolean
  onTokenChange: (value: string) => void
  onVerify: () => void
  onClose: () => void
}

export function TwoFactorSetupDialog({
  open,
  data,
  backupCodes,
  token,
  error,
  isVerifying,
  onTokenChange,
  onVerify,
  onClose,
}: TwoFactorSetupDialogProps) {
  if (!data) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      preventClose={isVerifying}
      titleId="two-factor-setup-title"
      contentClassName="max-h-[92vh] max-w-160 overflow-y-auto p-6"
      overlayClassName="z-160"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a]">
            Two-Factor Setup
          </p>
          <h2 id="two-factor-setup-title" className="mt-2 font-['Playfair_Display',serif] text-[26px] font-extrabold">
            {backupCodes.length === 0 ? 'Scan this QR code' : 'Save your backup codes'}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={isVerifying}
          aria-label="Close two-factor setup"
          className="rounded-full border border-[#e0d0c5] px-3 py-1.5 text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/9"
        >
          ✕
        </button>
      </div>

      {backupCodes.length === 0 ? (
        <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
          <div className="rounded-[18px] bg-white p-4">
            <img
              src={data.qrCodeDataUrl}
              alt="Two-factor authentication QR code"
              className="h-full w-full"
            />
          </div>

          <div>
            <p className="text-[13px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
              Open Google Authenticator, Microsoft Authenticator, Authy, or another TOTP app and scan this QR code.
            </p>

            <div className="mt-4 rounded-[14px] bg-[#f9f3ef] p-4 dark:bg-[#1a1816]">
              <MonoLabel>Manual Setup Key</MonoLabel>
              <div className="mt-2 break-all font-['DM_Mono',monospace] text-[13px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                {data.manualEntryKey}
              </div>
            </div>

            <div className="mt-4">
              <TextField
                label="6-Digit Authenticator Code"
                value={token}
                onChange={onTokenChange}
                placeholder="123456"
              />
            </div>

            {error && (
              <div className="mt-3">
                <InlineSecurityError message={error} />
              </div>
            )}

            <button
              type="button"
              onClick={onVerify}
              disabled={token.length !== 6 || isVerifying}
              className="mt-4 rounded-[11px] bg-[#2d6a47] px-5 py-3 text-[13px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#5cc98a] dark:text-[#141412]"
            >
              {isVerifying ? 'Verifying...' : 'Verify and Enable 2FA'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="rounded-2xl border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] p-4">
            <h3 className="text-[16px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">2FA is enabled</h3>
            <p className="mt-2 text-[13px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
              Save these backup codes somewhere safe. Each code can be used once if you lose access to your authenticator app.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {backupCodes.map((code) => (
              <div
                key={code}
                className="rounded-xl border-[1.5px] border-[#e0d0c5] bg-[#fffaf6] px-4 py-3 font-['DM_Mono',monospace] text-[14px] font-bold text-[#1a1714] dark:border-white/9 dark:bg-[#252320] dark:text-[#f2f0eb]"
              >
                {code}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 rounded-[11px] bg-[#b84c2b] px-5 py-3 text-[13px] font-bold text-white dark:bg-[#e8816a] dark:text-[#141412]"
          >
            I Saved My Backup Codes
          </button>
        </div>
      )}
    </Modal>
  )
}

interface DisableTwoFactorDialogProps {
  open: boolean
  token: string
  error: string
  isPending: boolean
  onTokenChange: (value: string) => void
  onConfirm: () => void
  onClose: () => void
}

export function DisableTwoFactorDialog({
  open,
  token,
  error,
  isPending,
  onTokenChange,
  onConfirm,
  onClose,
}: DisableTwoFactorDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      preventClose={isPending}
      role="alertdialog"
      titleId="disable-two-factor-title"
      descriptionId="disable-two-factor-description"
      contentClassName="max-w-120 p-6"
      overlayClassName="z-160"
    >
      <h2 id="disable-two-factor-title" className="font-['Playfair_Display',serif] text-[24px] font-extrabold">
        Disable Two-Factor Authentication
      </h2>
      <p id="disable-two-factor-description" className="mt-3 text-[13px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
        Enter a current 6-digit authenticator code to disable 2FA.
      </p>

      <div className="mt-4">
        <TextField label="Authenticator Code" value={token} onChange={onTokenChange} placeholder="123456" />
      </div>

      {error && <div className="mt-3"><InlineSecurityError message={error} /></div>}

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2.5 text-[13px] font-semibold disabled:opacity-50 dark:border-white/9"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={token.length !== 6 || isPending}
          onClick={onConfirm}
          className="rounded-[10px] bg-[#c43c3c] px-4 py-2.5 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Disabling...' : 'Disable 2FA'}
        </button>
      </div>
    </Modal>
  )
}

interface DeleteAccountDialogProps {
  open: boolean
  confirmation: string
  currentPassword: string
  twoFactorCode: string
  requirePassword: boolean
  requireTwoFactor: boolean
  error: string
  isPending: boolean
  canSubmit: boolean
  onConfirmationChange: (value: string) => void
  onCurrentPasswordChange: (value: string) => void
  onTwoFactorCodeChange: (value: string) => void
  onConfirm: () => void
  onClose: () => void
}

export function DeleteAccountDialog({
  open,
  confirmation,
  currentPassword,
  twoFactorCode,
  requirePassword,
  requireTwoFactor,
  error,
  isPending,
  canSubmit,
  onConfirmationChange,
  onCurrentPasswordChange,
  onTwoFactorCodeChange,
  onConfirm,
  onClose,
}: DeleteAccountDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      preventClose={isPending}
      role="alertdialog"
      titleId="delete-account-title"
      descriptionId="delete-account-description"
      contentClassName="max-w-120 p-6"
      overlayClassName="z-160"
    >
      <h2 id="delete-account-title" className="font-['Playfair_Display',serif] text-[24px] font-extrabold text-[#c43c3c] dark:text-[#e05252]">
        Schedule Account Deletion
      </h2>
      <p id="delete-account-description" className="mt-3 text-[13px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
        Type <strong>DELETE</strong> to continue. Your account will be scheduled for deletion after <strong>30 days</strong>. Signing in again during that recovery window automatically cancels the request.
      </p>

      <div className="mt-4 space-y-4">
        <TextField label="Confirmation" value={confirmation} onChange={onConfirmationChange} placeholder="DELETE" />
        {requirePassword && (
          <TextField label="Current Password" value={currentPassword} onChange={onCurrentPasswordChange} type="password" placeholder="Re-enter your password" />
        )}
        {requireTwoFactor && (
          <TextField label="Two-Factor Code" value={twoFactorCode} onChange={onTwoFactorCodeChange} placeholder="123456" />
        )}
      </div>

      {error && <div className="mt-3"><InlineSecurityError message={error} /></div>}

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2.5 text-[13px] font-semibold disabled:opacity-50 dark:border-white/9"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSubmit || isPending}
          onClick={onConfirm}
          className="rounded-[10px] bg-[#c43c3c] px-4 py-2.5 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Scheduling...' : 'Schedule Deletion'}
        </button>
      </div>
    </Modal>
  )
}

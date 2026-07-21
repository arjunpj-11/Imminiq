import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { ApiErrorBanner, FieldError } from '../components/AuthError';
import { EyeIcon } from '../components/icons/AuthIcons';
import { authInputClass, authLabelClass, cn } from '../utils/auth-ui';
import { getPasswordStrength, validatePassword } from '../utils/auth-validation';
import { ROUTES } from '../../../routes/config/route-paths';
import { getUserFacingError } from '../../../lib/user-facing-error';
import { useResetPassword } from '../hooks/useResetPassword';

interface IFormState {
  newPassword: string;
  confirmPassword: string;
}

interface IFormErrors {
  newPassword?: string;
  confirmPassword?: string;
  api?: string;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { resetToken?: string } | null;
  const resetToken = state?.resetToken;

  const [form, setForm] = useState<IFormState>({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<IFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const resetPassword = useResetPassword();

  const strength = useMemo(() => getPasswordStrength(form.newPassword), [form.newPassword]);

  const checks = {
    length: form.newPassword.length >= 8,
    letter: /[a-zA-Z]/.test(form.newPassword),
    numberOrSymbol: /[0-9\W]/.test(form.newPassword),
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));

    if (touched[name]) {
      setErrors((current) => ({ ...current, [name]: undefined, api: undefined }));
    }
  };

  const handleBlur = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));

    if (name === 'newPassword') {
      setErrors((current) => ({
        ...current,
        newPassword: validatePassword(value, 'New password'),
      }));
    }

    if (name === 'confirmPassword') {
      setErrors((current) => ({
        ...current,
        confirmPassword: !value
          ? 'Please confirm your password.'
          : value !== form.newPassword
            ? "Passwords don't match."
            : undefined,
      }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newErrors: IFormErrors = {};
    const passwordError = validatePassword(form.newPassword, 'New password');

    if (passwordError) newErrors.newPassword = passwordError;
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password.';
    else if (form.confirmPassword !== form.newPassword)
      newErrors.confirmPassword = "Passwords don't match.";
    if (!resetToken)
      newErrors.api = 'Reset session expired. Please request a new password reset code.';

    setErrors(newErrors);
    setTouched({ newPassword: true, confirmPassword: true });

    if (Object.keys(newErrors).length > 0) return;

    try {
      await resetPassword.mutateAsync({
        resetToken: resetToken!,
        newPassword: form.newPassword,
      });
      setIsSuccess(true);
    } catch (error: unknown) {
      setErrors({ api: getUserFacingError(error, 'Failed to reset password. Please try again.') });
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-(--surface-canvas) px-4 py-12 font-ui text-(--text-primary) dark:bg-(--surface-canvas) dark:text-(--text-primary)">
        <div className="w-full max-w-110 rounded-xl border border-(--border-subtle) bg-(--surface-card) px-6 py-8 text-center shadow-(--shadow-2) dark:border-white/15 dark:bg-(--surface-card)">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(76,175,125,0.10)] text-(--success)">
            ✓
          </div>
          <h1 className="font-serif text-[26px] font-bold">Password reset successful</h1>
          <p className="mt-2 text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
            You can now sign in with your new password.
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.login, { replace: true })}
            className="mt-6 w-full rounded-md bg-(--brand-500) p-3 text-[14px] font-bold text-[#f5ede4] dark:bg-(--brand-500) dark:text-[#141412]"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      badge="Password Recovery"
      title="Create new password"
      subtitle="Choose a strong password for your imminiq account."
    >
      <ApiErrorBanner message={errors.api} />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <label className="block">
          <span className={authLabelClass}>New password</span>
          <div className="relative">
            <input
              className={cn(
                authInputClass(errors.newPassword, touched.newPassword && !errors.newPassword),
                'pr-11'
              )}
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter new password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-secondary) dark:text-(--text-secondary)"
              onClick={() => setShowNew((value) => !value)}
            >
              <EyeIcon open={showNew} />
            </button>
          </div>
          <FieldError message={errors.newPassword} />
          {form.newPassword && (
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--border-subtle) dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-(--brand-500) dark:bg-(--brand-500)"
                  style={{ width: `${strength.level * 25}%` }}
                />
              </div>
              <span
                className={cn('font-mono text-[9px] uppercase tracking-widest', strength.textClass)}
              >
                {strength.label}
              </span>
            </div>
          )}
        </label>

        <div className="grid grid-cols-3 gap-2 text-[11px] text-(--text-secondary) dark:text-(--text-secondary)">
          <span className={checks.length ? 'text-(--success)' : ''}>8+ chars</span>
          <span className={checks.letter ? 'text-(--success)' : ''}>Letter</span>
          <span className={checks.numberOrSymbol ? 'text-(--success)' : ''}>Number/symbol</span>
        </div>

        <label className="block">
          <span className={authLabelClass}>Confirm password</span>
          <div className="relative">
            <input
              className={cn(
                authInputClass(
                  errors.confirmPassword,
                  touched.confirmPassword && !errors.confirmPassword
                ),
                'pr-11'
              )}
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-secondary) dark:text-(--text-secondary)"
              onClick={() => setShowConfirm((value) => !value)}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>
          <FieldError message={errors.confirmPassword} />
        </label>

        <button
          className="relative mt-1 w-full overflow-hidden rounded-md bg-(--brand-500) p-3.25 text-[15px] font-bold tracking-[0.01em] text-[#f5ede4] transition hover:-translate-y-px hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-70 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
          type="submit"
          disabled={resetPassword.isPending}
        >
          {resetPassword.isPending ? 'Resetting password…' : 'Reset password'}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-(--text-secondary) dark:text-(--text-secondary)">
        Need a new code?{' '}
        <Link to={ROUTES.forgotPassword} className="text-(--brand-500) dark:text-(--brand-500)">
          Request again
        </Link>
      </p>
    </AuthLayout>
  );
}

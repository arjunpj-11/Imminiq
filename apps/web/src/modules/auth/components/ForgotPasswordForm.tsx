import { STORAGE_KEYS } from '../../../lib/storage/storage-keys';
import { safeSessionStorage } from '../../../lib/storage/safe-storage';
import { useState } from 'react';
import type { ChangeEvent, FocusEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import { useForgotPassword } from '../hooks/useForgotPassword';
import AuthLayout from './AuthLayout';
import AuthIdentifierField from './AuthIdentifierField';
import { ApiErrorBanner } from './AuthError';
import { validateIdentifier } from '../utils/auth-validation';
import { ROUTES } from '../../../routes/config/route-paths';

interface IFormState {
  identifier: string;
}

interface IFormErrors {
  identifier?: string;
}

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const { mutate: forgotPassword, isPending, error } = useForgotPassword();
  const apiError =
    error?.response?.data?.message || (error ? 'Failed to send reset code. Please try again.' : '');

  const [form, setForm] = useState<IFormState>({ identifier: '' });
  const [errors, setErrors] = useState<IFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));

    if (touched[name]) {
      setErrors((current) => ({ ...current, [name]: validateIdentifier(value) }));
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({ ...current, [name]: validateIdentifier(value) }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const identifierError = validateIdentifier(form.identifier);
    setErrors({ identifier: identifierError });
    setTouched({ identifier: true });

    if (identifierError) return;

    const trimmedIdentifier = form.identifier.trim();

    safeSessionStorage.remove(STORAGE_KEYS.otpExpiry);
    safeSessionStorage.remove(STORAGE_KEYS.otpResendExpiry);

    forgotPassword(
      { identifier: trimmedIdentifier },
      {
        onSuccess: (data) => {
          navigate(ROUTES.verifyAccount, {
            replace: true,
            state: {
              identifier: data.data?.verificationTarget || trimmedIdentifier,
              method: data.data?.verificationMethod,
              purpose: 'password_reset',
              from: 'forgot-password',
            },
          });
        },
      }
    );
  };

  return (
    <AuthLayout
      badge="Password Recovery"
      title="Reset your password"
      subtitle="Enter your email or phone number and we'll send you a 6-digit reset code."
    >
      <ApiErrorBanner message={apiError} />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthIdentifierField
          value={form.identifier}
          error={errors.identifier}
          valid={Boolean(touched.identifier && !errors.identifier)}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <button
          className="relative mt-1 w-full overflow-hidden rounded-md bg-(--brand-500) p-3.25 text-[15px] font-bold tracking-[0.01em] text-[#f5ede4] transition hover:-translate-y-px hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-70 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
          type="submit"
          disabled={isPending}
        >
          {isPending ? 'Sending code…' : 'Send reset code'}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-(--text-secondary) dark:text-(--text-secondary)">
        Remembered it?{' '}
        <Link
          to={ROUTES.login}
          className="font-semibold text-(--brand-500) hover:opacity-70 dark:text-(--brand-500)"
        >
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}

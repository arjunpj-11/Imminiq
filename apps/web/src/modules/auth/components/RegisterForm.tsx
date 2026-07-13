import { STORAGE_KEYS } from '../../../lib/storage/storage-keys';
import { safeSessionStorage } from '../../../lib/storage/safe-storage';
import { useState } from 'react';
import type { ChangeEvent, FocusEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { useRegister } from '../hooks/useRegister';
import AuthLayout from './AuthLayout';
import AuthIdentifierField from './AuthIdentifierField';
import AuthSocialButtons from './AuthSocialButtons';
import { ApiErrorBanner, FieldError } from './AuthError';
import { EyeIcon } from './icons/AuthIcons';
import { authInputClass, authLabelClass, cn } from '../utils/auth-ui';
import {
  getPasswordStrength,
  validateIdentifier,
  validatePassword,
} from '../utils/auth-validation';

interface IFormState {
  fullName: string;
  identifier: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface IFormErrors {
  fullName?: string;
  identifier?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const validateField = (
  name: keyof IFormState,
  value: string | boolean,
  password?: string
): string | undefined => {
  switch (name) {
    case 'fullName': {
      const trimmed = (value as string).trim();
      if (!trimmed) return 'Full name is required.';
      if (trimmed.length < 3) return 'Name must be at least 3 characters.';
      if (!/[a-zA-Z]/.test(trimmed)) return 'Name must contain letters.';
      if (trimmed.length > 80) return 'Name is too long.';
      return undefined;
    }
    case 'identifier':
      return validateIdentifier(value as string);
    case 'password':
      return validatePassword(value as string);
    case 'confirmPassword':
      if (!value) return 'Please confirm your password.';
      if (value !== password) return "Passwords don't match.";
      return undefined;
    case 'terms':
      if (!value) return 'You must agree to continue.';
      return undefined;
    default:
      return undefined;
  }
};

export default function RegisterForm() {
  const { mutate: register, isPending, error } = useRegister();
  const apiError = error?.response?.data?.message;

  const [form, setForm] = useState<IFormState>({
    fullName: '',
    identifier: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [errors, setErrors] = useState<IFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const strength = getPasswordStrength(form.password);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    const fieldName = name as keyof IFormState;
    const fieldValue = type === 'checkbox' ? checked : value;

    setForm((current) => ({ ...current, [fieldName]: fieldValue }));

    if (touched[name]) {
      setErrors((current) => ({
        ...current,
        [fieldName]: validateField(
          fieldName,
          fieldValue,
          fieldName === 'confirmPassword' ? form.password : undefined
        ),
      }));
    }

    if (fieldName === 'password' && touched.confirmPassword) {
      setErrors((current) => ({
        ...current,
        confirmPassword: validateField('confirmPassword', form.confirmPassword, value),
      }));
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    const fieldName = name as keyof IFormState;
    const fieldValue = type === 'checkbox' ? checked : value;

    setTouched((current) => ({ ...current, [fieldName]: true }));
    setErrors((current) => ({
      ...current,
      [fieldName]: validateField(
        fieldName,
        fieldValue,
        fieldName === 'confirmPassword' ? form.password : undefined
      ),
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fields: (keyof IFormState)[] = [
      'fullName',
      'identifier',
      'password',
      'confirmPassword',
      'terms',
    ];
    const newErrors: IFormErrors = {};

    fields.forEach((field) => {
      const message = validateField(
        field,
        field === 'terms' ? form.terms : form[field],
        field === 'confirmPassword' ? form.password : undefined
      );
      if (message) newErrors[field] = message;
    });

    setErrors(newErrors);
    setTouched({
      fullName: true,
      identifier: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    if (Object.keys(newErrors).length > 0) return;

    safeSessionStorage.remove(STORAGE_KEYS.otpExpiry);
    safeSessionStorage.remove(STORAGE_KEYS.otpResendExpiry);

    register({
      fullName: form.fullName.trim(),
      identifier: form.identifier.trim(),
      password: form.password,
    });
  };

  return (
    <AuthLayout
      badge="Create account"
      title="Join Imminiq"
      subtitle="Build your personalized learning roadmap."
    >
      <ApiErrorBanner message={apiError} />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <label className="block">
          <span className={authLabelClass}>Full name</span>
          <input
            className={authInputClass(errors.fullName, touched.fullName && !errors.fullName)}
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Achu Scholar"
            autoComplete="name"
          />
          <FieldError message={errors.fullName} />
        </label>

        <AuthIdentifierField
          value={form.identifier}
          error={errors.identifier}
          valid={Boolean(touched.identifier && !errors.identifier)}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <label className="block">
          <span className={authLabelClass}>Password</span>
          <div className="relative">
            <input
              className={cn(
                authInputClass(errors.password, touched.password && !errors.password),
                'pr-11'
              )}
              type={showPw ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Create password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-secondary) transition hover:text-(--brand-500) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
              onClick={() => setShowPw((value) => !value)}
            >
              <EyeIcon open={showPw} />
            </button>
          </div>
          <FieldError message={errors.password} />
          {form.password && (
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
              type={showCpw ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Repeat password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-secondary) transition hover:text-(--brand-500) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
              onClick={() => setShowCpw((value) => !value)}
            >
              <EyeIcon open={showCpw} />
            </button>
          </div>
          <FieldError message={errors.confirmPassword} />
        </label>

        <label className="flex items-start gap-2 text-[12.5px] leading-normal text-(--text-secondary) dark:text-(--text-secondary)">
          <input
            type="checkbox"
            name="terms"
            checked={form.terms}
            onChange={handleChange}
            onBlur={handleBlur}
            className="mt-0.5 accent-(--brand-500) dark:accent-(--brand-500)"
          />
          <span>
            I agree to the{' '}
            <Link to="/terms" className="text-(--brand-500) dark:text-(--brand-500)">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-(--brand-500) dark:text-(--brand-500)">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        <FieldError message={errors.terms} />

        <button
          className="relative mt-1 w-full overflow-hidden rounded-md bg-(--brand-500) p-3.25 text-[15px] font-bold tracking-[0.01em] text-[#f5ede4] transition hover:-translate-y-px hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-70 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
          type="submit"
          disabled={isPending}
        >
          {isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-(--border-subtle) dark:bg-white/15" />
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-(--text-secondary) opacity-60 dark:text-(--text-secondary)">
          Or
        </span>
        <div className="h-px flex-1 bg-(--border-subtle) dark:bg-white/15" />
      </div>
      <AuthSocialButtons />

      <p className="mt-6 text-center text-[13px] text-(--text-secondary) dark:text-(--text-secondary)">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-(--brand-500) hover:opacity-70 dark:text-(--brand-500)"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

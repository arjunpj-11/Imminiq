import type { AxiosError } from 'axios';

interface IApiErrorResponse {
  message?: string;
  error?: { message?: string };
  errors?: Array<{ message?: string }>;
}

export const getApiErrorMessage = (error: unknown, fallbackMessage: string): string => {
  const axiosError = error as AxiosError<IApiErrorResponse>;

  return (
    axiosError.response?.data?.message ??
    axiosError.response?.data?.error?.message ??
    axiosError.response?.data?.errors?.[0]?.message ??
    fallbackMessage
  );
};

export const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() ?? '';

export const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export const getPasswordScore = (password: string) => {
  let score = 0;

  if (password.length >= 8) score += 30;
  if (password.length >= 12) score += 20;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;

  return Math.min(100, score);
};

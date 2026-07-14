export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

export type ApiErrorEnvelope = {
  success: false;
  message: string;
  code: string;
  errors?: Record<string, string[]>;
};

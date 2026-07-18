const SENSITIVE_KEY =
  /(authorization|cookie|token|secret|password|passcode|otp|mfa|api[-_]?key|session|credential)/i;

export function redactSensitiveMetadata(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSensitiveMetadata);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
      key,
      SENSITIVE_KEY.test(key) ? "[REDACTED]" : redactSensitiveMetadata(nested),
    ]),
  );
}

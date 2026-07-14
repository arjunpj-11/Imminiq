/** Deployment policy supplied by the composition root; it has no ENV dependency. */
export type AuthRuntimePolicy = {
  pendingRegistrationTtlSeconds: number;
  twoFactorChallengeTtlMinutes: number;
};

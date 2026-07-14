export const ADMIN_AI_TOKEN_SPEND_ROUTE_PATHS = {
  ROOT: '/',
} as const;

export type AdminAITokenSpendRoutePath =
  (typeof ADMIN_AI_TOKEN_SPEND_ROUTE_PATHS)[keyof typeof ADMIN_AI_TOKEN_SPEND_ROUTE_PATHS];

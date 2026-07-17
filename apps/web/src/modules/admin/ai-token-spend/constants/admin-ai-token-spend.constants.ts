import { ADMIN_ROUTES } from "../../../../routes/config/route-paths";

export const ADMIN_AI_TOKEN_SPEND_ENDPOINTS = {
  overview: "/admin/ai-token-spend",
} as const;

export const ADMIN_AI_TOKEN_SPEND_ROUTES = {
  overview: ADMIN_ROUTES.aiTokenSpend,
} as const;

export const ADMIN_AI_TOKEN_SPEND_STALE_TIME_MS = 30_000;

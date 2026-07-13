export const UPLOAD_ROUTE_PATHS = {
  AVATAR: '/avatar',
  AVATAR_AI_PREVIEW: '/avatar/ai-preview',

  BANNER: '/banner',
  BANNER_AI_PREVIEW: '/banner/ai-preview',
} as const;

export type UploadRoutePath = (typeof UPLOAD_ROUTE_PATHS)[keyof typeof UPLOAD_ROUTE_PATHS];

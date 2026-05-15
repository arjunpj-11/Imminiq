import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  MONGO_URI: z.string(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string(),
  SERVER_URL: z.string().default("http://localhost:5001"),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  GROQ_API_KEY: z.string(),
  GEMINI_API_KEY: z.string(),
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
  EMAIL_FROM: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  FAST2SMS_API_KEY: z.string().min(1),
  MESSAGE_CENTRAL_CUSTOMER_ID: z.string().min(1),
  MESSAGE_CENTRAL_EMAIL: z.string().email(),
  MESSAGE_CENTRAL_PASSWORD: z.string().min(1),
  MESSAGE_CENTRAL_COUNTRY_CODE: z.string().default("91"),
  CEREBRAS_API_KEY: z.string().min(1),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1, 'CLOUDFLARE_ACCOUNT_ID is required'),
CLOUDFLARE_AI_API_TOKEN: z
  .string()
  .min(1, 'CLOUDFLARE_AI_API_TOKEN is required'),
CLOUDFLARE_IMAGE_MODEL: z
  .string()
  .default('@cf/black-forest-labs/flux-1-schnell'),
});

export const env = envSchema.parse(process.env);

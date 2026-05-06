import { z } from 'zod';
import { loadEnv } from './env';

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  APP_NAME: z.string().default('beats-api'),
  APP_URL: z.string().url().default('http://localhost:4000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(30),

  CORS_ORIGINS: z.string().default('*'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  CONTABO_ENDPOINT: z.string().url(),
  CONTABO_CLIENT_ID: z.string().min(1, 'CONTABO_CLIENT_ID is required'),
  CONTABO_CLIENT_SECRET: z.string().min(1, 'CONTABO_CLIENT_SECRET is required'),
  CONTABO_BUCKET_NAME: z.string().min(1).default('profile.avatars'),
  CONTABO_BUCKET_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[config] Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

const env = parsed.data;

export const config = {
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',

  app: {
    name: env.APP_NAME,
    url: env.APP_URL,
    port: env.PORT,
  },

  database: {
    url: env.DATABASE_URL,
  },

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  passwordReset: {
    ttlMinutes: env.PASSWORD_RESET_TOKEN_TTL_MINUTES,
  },

  cors: {
    origins: env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  },

  log: {
    level: env.LOG_LEVEL,
  },

  storage: {
    endpoint: env.CONTABO_ENDPOINT,
    clientId: env.CONTABO_CLIENT_ID,
    clientSecret: env.CONTABO_CLIENT_SECRET,
    profilesBucket: env.CONTABO_BUCKET_NAME,
    profilesBucketUrl: env.CONTABO_BUCKET_URL,
  },
} as const;

export type AppConfig = typeof config;

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
  CONTABO_ACCESS_ID: z.string().min(1, 'CONTABO_ACCESS_ID is required'),
  CONTABO_ACCESS_KEY: z.string().min(1, 'CONTABO_ACCESS_KEY is required'),
  CONTABO_AVATAR_BUCKET_NAME: z.string().min(1).default('profile.avatars'),
  CONTABO_AVATAR_BASE_URL: z.string().url(),
  BEAT_BUCKET_NAME: z.string().min(1).default('beats'),

  MAIL_HOST: z.string().min(1),
  MAIL_PORT: z.coerce.number().int().positive().default(465),
  MAIL_USER: z.string().min(1),
  MAIL_PASS: z.string().min(1),
  MAIL_FROM: z.string().min(1).default('Beatpillz <mail@beatpillz.com>'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  EMAIL_VERIFICATION_TTL_MINUTES: z.coerce.number().int().positive().default(1440),

  // OAuth — Google Sign-In. Comma-separated list of allowed audiences (OAuth 2.0
  // client IDs): the web client ID plus any native iOS/Android client IDs.
  GOOGLE_CLIENT_ID: z.string().default(''),

  // Payments — common.
  // Return URL the gateway redirects the buyer to after the hosted payment page.
  // It is NOT a processed endpoint: payment confirmation is webhook-only, and the
  // app simply intercepts this URL to know to start polling /checkout/{id}/status.
  PAYMENT_CALLBACK_URL: z.string().url().default('http://localhost:3000/payment/return'),
  PAYMENT_BASE_CURRENCY: z.string().default('USD'),

  // Paystack
  PAYSTACK_SECRET_KEY: z.string().default(''),
  PAYSTACK_PUBLIC_KEY: z.string().default(''),

  // Flutterwave
  FLW_SECRET_KEY: z.string().default(''),
  FLW_PUBLIC_KEY: z.string().default(''),
  FLW_WEBHOOK_HASH: z.string().default(''),
  // z.coerce.boolean() treats any non-empty string (incl. "false") as true, so parse explicitly.
  FLW_GOOGLE_PAY_ENABLED: z
    .string()
    .default('false')
    .transform((v) => v.toLowerCase() === 'true'),

  // OPay
  OPAY_MERCHANT_ID: z.string().default(''),
  OPAY_PUBLIC_KEY: z.string().default(''),
  OPAY_SECRET_KEY: z.string().default(''),
  OPAY_BASE_URL: z.string().url().default('https://sandboxapi.opaycheckout.com'),
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
    accessId: env.CONTABO_ACCESS_ID,
    accessKey: env.CONTABO_ACCESS_KEY,
    avatarBucket: env.CONTABO_AVATAR_BUCKET_NAME,
    avatarBaseUrl: env.CONTABO_AVATAR_BASE_URL,
    beatBucket: env.BEAT_BUCKET_NAME,
  },

  mail: {
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
    from: env.MAIL_FROM,
  },

  emailVerification: {
    ttlMinutes: env.EMAIL_VERIFICATION_TTL_MINUTES,
  },

  frontend: {
    url: env.FRONTEND_URL,
  },

  oauth: {
    google: {
      // Allowed token audiences. Empty array → Google Sign-In is disabled.
      clientIds: env.GOOGLE_CLIENT_ID.split(',').map((id) => id.trim()).filter(Boolean),
    },
  },

  payments: {
    callbackUrl: env.PAYMENT_CALLBACK_URL,
    baseCurrency: env.PAYMENT_BASE_CURRENCY,
    paystack: {
      secretKey: env.PAYSTACK_SECRET_KEY,
      publicKey: env.PAYSTACK_PUBLIC_KEY,
    },
    flutterwave: {
      secretKey: env.FLW_SECRET_KEY,
      publicKey: env.FLW_PUBLIC_KEY,
      webhookHash: env.FLW_WEBHOOK_HASH,
      googlePayEnabled: env.FLW_GOOGLE_PAY_ENABLED,
    },
    opay: {
      merchantId: env.OPAY_MERCHANT_ID,
      publicKey: env.OPAY_PUBLIC_KEY,
      secretKey: env.OPAY_SECRET_KEY,
      baseUrl: env.OPAY_BASE_URL,
    },
  },
} as const;

export type AppConfig = typeof config;

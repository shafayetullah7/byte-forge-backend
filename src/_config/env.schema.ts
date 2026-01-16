// src/config/env.schema.ts
import { z } from 'zod';

export const envSchema = z
  .object({
    // === Application Settings ===
    NODE_ENV: z.enum(['development', 'test', 'production']),
    PORT: z.coerce.number(),
    APP_NAME: z.string(),

    // === Database ===
    DB_HOST: z.string(),
    DB_PORT: z.coerce.number(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),

    DATABASE_URL: z.string().url().optional(),
    // === Docker Compose ===
    COMPOSE_PROJECT_NAME: z.string(),
    APP_EXTERNAL_PORT: z.coerce.number(),
    DB_EXTERNAL_PORT: z.coerce.number(),
    SALT_ROUNDS: z.coerce.number(),

    // Email / SMTP
    MAIL_PROVIDER: z.enum(['gmail', 'smtp', 'console']),
    MAIL_HOST: z.string(),
    MAIL_PORT: z.coerce.number(),
    MAIL_SECURE: z.string(),
    MAIL_USER: z.string().optional(),
    MAIL_PASSWORD: z.string().optional(),
    MAIL_FROM_NAME: z.string(),
    MAIL_FROM_EMAIL: z.string().email(),

    // Legacy SMTP (kept for backwards compatibility)
    GMAIL_USER: z.string().optional(),
    GMAIL_APP_PASSWORD: z.string().optional(),
    DEFAULT_FROM_EMAIL: z.string().email().optional(),

    CLOUDINARY_CLOUD_NAME: z.string().nonempty().max(255),
    CLOUDINARY_API_KEY: z.string().nonempty().max(255),
    CLOUDINARY_API_SECRET: z.string().nonempty().max(255),

    // === JWT Secrets ===
    JWT_SECRET_RESET_REQUEST: z.string().min(32),
    JWT_SECRET_RESET_ACCESS: z.string().min(32),
  })
  .transform((data) => {
    const dbUrl = data.DATABASE_URL;
    if (dbUrl) return data;
    const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = data;
    return {
      ...data,
      DATABASE_URL: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
    };
  });

export type AppEnv = z.infer<typeof envSchema>;

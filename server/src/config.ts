import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  DATABASE_PATH: z.string().default('./data/pagehoarder.db'),
  STORAGE_PATH: z.string().default('./data/archive'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  BODY_SIZE_LIMIT: z.string().default('10mb'),
});

export const config = envSchema.parse(process.env);
export type Config = z.infer<typeof envSchema>;

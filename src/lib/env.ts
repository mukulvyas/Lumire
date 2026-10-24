import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default('https://soiree-demo.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default('dummy_anon_key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default('dummy_service_key'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:54322/postgres'),
  LLM_PROVIDER: z.enum(['gemini', 'mock']).default('gemini'),
  GEMINI_API_KEY: z.string().optional().default(''),
  LLM_MODEL: z.string().default('gemini-1.5-flash'),
  APP_URL: z.string().url().default('http://localhost:3000'),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  LLM_PROVIDER: process.env.LLM_PROVIDER,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  LLM_MODEL: process.env.LLM_MODEL,
  APP_URL: process.env.APP_URL,
});

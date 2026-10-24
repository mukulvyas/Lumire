import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '@/lib/env';

// Cache database connection in development to prevent connection exhaustion during hot reloading
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const connectionString = env.DATABASE_URL;

export const client = globalForDb.conn ?? postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {},
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.conn = client;
}

export const db = drizzle(client, { schema });

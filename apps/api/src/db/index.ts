import { drizzle } from 'drizzle-orm/neon-http';
import 'dotenv/config';
import * as schema from './schema';

if (!process.env.DB_URL) {
  throw new Error('db url not found');
}

export const db = drizzle(process.env.DB_URL, { schema });

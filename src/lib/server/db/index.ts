// src/lib/server/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config(); // Load .env variables

const dbUrl = process.env.POSTGRES_URL;

if (!dbUrl) {
  throw new Error('POSTGRES_URL environment variable is not set. Please ensure it is defined in your .env file or environment.');
}

const sql = neon(dbUrl);
// Pass the schema to drizzle, so it knows about all your tables
export const db = drizzle(sql, { schema });
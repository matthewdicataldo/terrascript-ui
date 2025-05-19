// drizzle.config.ts
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config(); // Load .env variables

// Use POSTGRES_URL as per user's .env file structure
const { POSTGRES_URL } = process.env;

if (!POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set for Drizzle Kit');
}

export default {
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle_migrations', // Output directory for migrations
  dialect: 'postgresql', // Specify the dialect
  dbCredentials: {
    url: POSTGRES_URL, // Use the POSTGRES_URL
  },
  // Optionally, specify driver if needed, though for 'pg' dialect it's often inferred
  // driver: 'pg',
} satisfies Config;
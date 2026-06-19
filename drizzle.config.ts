import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

const env = process.env.NODE_ENV || 'development';

dotenv.config({ path: `.env.${env}` });

console.log(`Loading environment: ${env}`);
console.log({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
});

export default defineConfig({
  schema: './src/_db/drizzle/schema',
  out: './src/_db/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // url: databaseUrl,
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: process.env.DB_SSL === 'true',
  },
  verbose: true,
  strict: true,
  migrations: {
    table: 'drizzle_migrations',
    // tableName: 'drizzle_migrations',
  },
});

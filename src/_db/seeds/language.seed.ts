import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import * as dotenv from 'dotenv';

// Load environment variables
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

const config = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const pool = new Pool(config);
const db = drizzle(pool, { schema });

export async function seedLanguages() {
  console.log('🌱 Seeding languages...');

  const languages = [
    { code: 'en', name: 'English', isRtl: false, isActive: true },
    { code: 'bn', name: 'Bengali', isRtl: false, isActive: true },
    { code: 'ar', name: 'Arabic', isRtl: true, isActive: true },
    { code: 'es', name: 'Spanish', isRtl: false, isActive: true },
    { code: 'fr', name: 'French', isRtl: false, isActive: true },
  ];

  try {
    for (const lang of languages) {
      await db.insert(schema.languagesTable)
        .values(lang)
        .onConflictDoUpdate({
          target: schema.languagesTable.code,
          set: { name: lang.name, isRtl: lang.isRtl, isActive: lang.isActive }
        });
    }
    console.log('✅ Languages seeding completed!');
  } catch (error) {
    console.error('❌ Languages seeding failed:', error);
    throw error;
  }
}

if (require.main === module) {
  seedLanguages()
    .catch(console.error)
    .finally(() => pool.end());
}

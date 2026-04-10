import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import * as dotenv from 'dotenv';
import { notInArray } from 'drizzle-orm';

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
  console.log('🌱 Refining system languages...');

  const languages = [
    { code: 'en', name: 'English', isRtl: false, isActive: true },
    { code: 'bn', name: 'বাংলা', isRtl: false, isActive: true },
  ];

  try {
    // 1. Insert/Update the wanted languages
    for (const lang of languages) {
      await db.insert(schema.languagesTable)
        .values(lang)
        .onConflictDoUpdate({
          target: schema.languagesTable.code,
          set: { name: lang.name, isRtl: lang.isRtl, isActive: lang.isActive }
        });
    }

    // 2. Remove languages NOT in our list
    // Note: This might fail if there are active translations in other languages
    // because of foreign key constraints without cascade delete.
    const allowedCodes = languages.map(l => l.code);
    
    // We try to delete dependent translations first to ensure we can remove the language
    console.log('🧹 Cleaning up unused translations and languages...');
    
    await db.delete(schema.tagTranslationsTable)
      .where(notInArray(schema.tagTranslationsTable.locale, allowedCodes));
      
    await db.delete(schema.tagGroupTranslationsTable)
      .where(notInArray(schema.tagGroupTranslationsTable.locale, allowedCodes));
      
    await db.delete(schema.categoryTranslationsTable)
      .where(notInArray(schema.categoryTranslationsTable.locale, allowedCodes));
      
    await db.delete(schema.languagesTable)
      .where(notInArray(schema.languagesTable.code, allowedCodes));

    console.log('✅ Languages refinement completed!');
  } catch (error: any) {
    if (error.code === '23503') {
        console.warn('⚠️ Could not remove some languages due to foreign key constraints. Make sure all translations are cleared.');
    } else {
        console.error('❌ Languages refinement failed:', error);
    }
    throw error;
  }
}

if (require.main === module) {
  seedLanguages()
    .catch(console.error)
    .finally(() => pool.end());
}

import * as dotenv from 'dotenv';
import { eq, sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { seed as drizzleSeed } from 'drizzle-seed';
import * as bcrypt from 'bcrypt';
import * as schema from '../drizzle/schema';

// Load environment variables
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });
console.log(`Loading environment: ${env}`);

console.log({
  env:process.env.NODE_ENV ,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
});

const config = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

console.log(config);

const pool = new Pool(config);

const db = drizzle(pool, { schema });

/**
 * Default Admin Configuration
 */
const DEFAULT_ADMIN = {
  firstName: 'System',
  lastName: 'Admin',
  userName: 'admin',
  email: 'admin@byteforge.com',
  password: 'AdminPassword123!',
};

/**
 * Seeder for Admin User using Drizzle Seed
 */
export async function seedAdmin() {
  console.log('🌱 Seeding admin user...');

  const hashedAdminPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

  try {
    // Check if admin already exists before seeding
    const existing = await db.select().from(schema.adminLocalAuthTable).where(
      eq(schema.adminLocalAuthTable.email, DEFAULT_ADMIN.email)
    ).limit(1);

    if (existing.length > 0) {
      console.log('⚠️ Admin already exists. Skipping Drizzle Seed.');
      return;
    }

    await drizzleSeed(db, {
      adminTable: schema.adminTable,
      adminLocalAuthTable: schema.adminLocalAuthTable,
    }).refine((f) => ({
      adminTable: {
        count: 1,
        columns: {
          firstName: f.valuesFromArray({ values: [DEFAULT_ADMIN.firstName] }),
          lastName: f.valuesFromArray({ values: [DEFAULT_ADMIN.lastName] }),
          userName: f.valuesFromArray({ values: [DEFAULT_ADMIN.userName] }),
        },
        with: {
          adminLocalAuthTable: 1,
        }
      },
      adminLocalAuthTable: {
        count: 1,
        columns: {
          email: f.valuesFromArray({ values: [DEFAULT_ADMIN.email] }),
          password: f.valuesFromArray({ values: [hashedAdminPassword] }),
          verfied: f.valuesFromArray({ values: [true] }),
        }
      },
    }));

    console.log('✅ Admin seeding completed!');
    console.log(`📧 Admin Email: ${DEFAULT_ADMIN.email}`);
    console.log(`🔑 Admin Password: ${DEFAULT_ADMIN.password}`);
  } catch (error) {
    console.error('❌ Admin seeding failed:', error);
    throw error;
  }
}

// Allow standalone execution
if (require.main === module) {
  seedAdmin()
    .catch(console.error)
    .finally(() => pool.end());
}

import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { notInArray, inArray } from 'drizzle-orm';
import * as schema from '../drizzle/schema';

// Load environment variables
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const db = drizzle(pool, { schema });

// Bangladesh geographic data: 8 divisions, 64 districts
const DIVISIONS_DATA = [
  {
    code: 'BD-A',
    sortOrder: 1,
    translations: [
      { locale: 'en', name: 'Barishal' },
      { locale: 'bn', name: 'বরিশাল' },
    ],
    districts: [
      {
        code: 'BD-01',
        sortOrder: 1,
        translations: [
          { locale: 'en', name: 'Barguna' },
          { locale: 'bn', name: 'বরগুনা' },
        ],
      },
      {
        code: 'BD-02',
        sortOrder: 2,
        translations: [
          { locale: 'en', name: 'Barishal' },
          { locale: 'bn', name: 'বরিশাল' },
        ],
      },
      {
        code: 'BD-03',
        sortOrder: 3,
        translations: [
          { locale: 'en', name: 'Bhola' },
          { locale: 'bn', name: 'ভোলা' },
        ],
      },
      {
        code: 'BD-04',
        sortOrder: 4,
        translations: [
          { locale: 'en', name: 'Jhalokathi' },
          { locale: 'bn', name: 'ঝালকাঠি' },
        ],
      },
      {
        code: 'BD-05',
        sortOrder: 5,
        translations: [
          { locale: 'en', name: 'Patuakhali' },
          { locale: 'bn', name: 'পটুয়াখালী' },
        ],
      },
      {
        code: 'BD-06',
        sortOrder: 6,
        translations: [
          { locale: 'en', name: 'Pirojpur' },
          { locale: 'bn', name: 'পিরোজপুর' },
        ],
      },
    ],
  },
  {
    code: 'BD-B',
    sortOrder: 2,
    translations: [
      { locale: 'en', name: 'Chattogram' },
      { locale: 'bn', name: 'চট্টগ্রাম' },
    ],
    districts: [
      {
        code: 'BD-07',
        sortOrder: 1,
        translations: [
          { locale: 'en', name: 'Bandarban' },
          { locale: 'bn', name: 'বান্দরবান' },
        ],
      },
      {
        code: 'BD-08',
        sortOrder: 2,
        translations: [
          { locale: 'en', name: 'Brahmanbaria' },
          { locale: 'bn', name: 'ব্রাহ্মণবাড়িয়া' },
        ],
      },
      {
        code: 'BD-09',
        sortOrder: 3,
        translations: [
          { locale: 'en', name: 'Chandpur' },
          { locale: 'bn', name: 'চাঁদপুর' },
        ],
      },
      {
        code: 'BD-10',
        sortOrder: 4,
        translations: [
          { locale: 'en', name: 'Chattogram' },
          { locale: 'bn', name: 'চট্টগ্রাম' },
        ],
      },
      {
        code: 'BD-11',
        sortOrder: 5,
        translations: [
          { locale: 'en', name: 'Cumilla' },
          { locale: 'bn', name: 'কুমিল্লা' },
        ],
      },
      {
        code: 'BD-12',
        sortOrder: 6,
        translations: [
          { locale: 'en', name: "Cox's Bazar" },
          { locale: 'bn', name: 'কক্স বাজার' },
        ],
      },
      {
        code: 'BD-13',
        sortOrder: 7,
        translations: [
          { locale: 'en', name: 'Feni' },
          { locale: 'bn', name: 'ফেনী' },
        ],
      },
      {
        code: 'BD-14',
        sortOrder: 8,
        translations: [
          { locale: 'en', name: 'Khagrachhari' },
          { locale: 'bn', name: 'খাগড়াছড়ি' },
        ],
      },
      {
        code: 'BD-15',
        sortOrder: 9,
        translations: [
          { locale: 'en', name: 'Lakshmipur' },
          { locale: 'bn', name: 'লক্ষ্মীপুর' },
        ],
      },
      {
        code: 'BD-16',
        sortOrder: 10,
        translations: [
          { locale: 'en', name: 'Noakhali' },
          { locale: 'bn', name: 'নোয়াখালী' },
        ],
      },
      {
        code: 'BD-17',
        sortOrder: 11,
        translations: [
          { locale: 'en', name: 'Rangamati' },
          { locale: 'bn', name: 'রাঙ্গামাটি' },
        ],
      },
    ],
  },
  {
    code: 'BD-C',
    sortOrder: 3,
    translations: [
      { locale: 'en', name: 'Dhaka' },
      { locale: 'bn', name: 'ঢাকা' },
    ],
    districts: [
      {
        code: 'BD-18',
        sortOrder: 1,
        translations: [
          { locale: 'en', name: 'Dhaka' },
          { locale: 'bn', name: 'ঢাকা' },
        ],
      },
      {
        code: 'BD-19',
        sortOrder: 2,
        translations: [
          { locale: 'en', name: 'Faridpur' },
          { locale: 'bn', name: 'ফরিদপুর' },
        ],
      },
      {
        code: 'BD-20',
        sortOrder: 3,
        translations: [
          { locale: 'en', name: 'Gazipur' },
          { locale: 'bn', name: 'গাজীপুর' },
        ],
      },
      {
        code: 'BD-21',
        sortOrder: 4,
        translations: [
          { locale: 'en', name: 'Gopalganj' },
          { locale: 'bn', name: 'গোপালগঞ্জ' },
        ],
      },
      {
        code: 'BD-22',
        sortOrder: 5,
        translations: [
          { locale: 'en', name: 'Kishoreganj' },
          { locale: 'bn', name: 'কিশোরগঞ্জ' },
        ],
      },
      {
        code: 'BD-23',
        sortOrder: 6,
        translations: [
          { locale: 'en', name: 'Madaripur' },
          { locale: 'bn', name: 'মাদারীপুর' },
        ],
      },
      {
        code: 'BD-24',
        sortOrder: 7,
        translations: [
          { locale: 'en', name: 'Manikganj' },
          { locale: 'bn', name: 'মানিকগঞ্জ' },
        ],
      },
      {
        code: 'BD-25',
        sortOrder: 8,
        translations: [
          { locale: 'en', name: 'Munshiganj' },
          { locale: 'bn', name: 'মুন্সীগঞ্জ' },
        ],
      },
      {
        code: 'BD-26',
        sortOrder: 9,
        translations: [
          { locale: 'en', name: 'Mymensingh' },
          { locale: 'bn', name: 'ময়মনসিংহ' },
        ],
      },
      {
        code: 'BD-27',
        sortOrder: 10,
        translations: [
          { locale: 'en', name: 'Narayanganj' },
          { locale: 'bn', name: 'নারায়ণগঞ্জ' },
        ],
      },
      {
        code: 'BD-28',
        sortOrder: 11,
        translations: [
          { locale: 'en', name: 'Narsingdi' },
          { locale: 'bn', name: 'নরসিংদী' },
        ],
      },
      {
        code: 'BD-29',
        sortOrder: 12,
        translations: [
          { locale: 'en', name: 'Rajbari' },
          { locale: 'bn', name: 'রাজবাড়ী' },
        ],
      },
      {
        code: 'BD-30',
        sortOrder: 13,
        translations: [
          { locale: 'en', name: 'Shariatpur' },
          { locale: 'bn', name: 'শরীয়তপুর' },
        ],
      },
      {
        code: 'BD-31',
        sortOrder: 14,
        translations: [
          { locale: 'en', name: 'Tangail' },
          { locale: 'bn', name: 'টাঙ্গাইল' },
        ],
      },
    ],
  },
  {
    code: 'BD-D',
    sortOrder: 4,
    translations: [
      { locale: 'en', name: 'Khulna' },
      { locale: 'bn', name: 'খুলনা' },
    ],
    districts: [
      {
        code: 'BD-32',
        sortOrder: 1,
        translations: [
          { locale: 'en', name: 'Bagerhat' },
          { locale: 'bn', name: 'বাগেরহাট' },
        ],
      },
      {
        code: 'BD-33',
        sortOrder: 2,
        translations: [
          { locale: 'en', name: 'Chuadanga' },
          { locale: 'bn', name: 'চুয়াডাঙ্গা' },
        ],
      },
      {
        code: 'BD-34',
        sortOrder: 3,
        translations: [
          { locale: 'en', name: 'Jashore' },
          { locale: 'bn', name: 'যশোর' },
        ],
      },
      {
        code: 'BD-35',
        sortOrder: 4,
        translations: [
          { locale: 'en', name: 'Jhenaidah' },
          { locale: 'bn', name: 'ঝিনাইদহ' },
        ],
      },
      {
        code: 'BD-36',
        sortOrder: 5,
        translations: [
          { locale: 'en', name: 'Khulna' },
          { locale: 'bn', name: 'খুলনা' },
        ],
      },
      {
        code: 'BD-37',
        sortOrder: 6,
        translations: [
          { locale: 'en', name: 'Kushtia' },
          { locale: 'bn', name: 'কুষ্টিয়া' },
        ],
      },
      {
        code: 'BD-38',
        sortOrder: 7,
        translations: [
          { locale: 'en', name: 'Magura' },
          { locale: 'bn', name: 'মাগুরা' },
        ],
      },
      {
        code: 'BD-39',
        sortOrder: 8,
        translations: [
          { locale: 'en', name: 'Meherpur' },
          { locale: 'bn', name: 'মেহেরপুর' },
        ],
      },
      {
        code: 'BD-40',
        sortOrder: 9,
        translations: [
          { locale: 'en', name: 'Narail' },
          { locale: 'bn', name: 'নড়াইল' },
        ],
      },
      {
        code: 'BD-41',
        sortOrder: 10,
        translations: [
          { locale: 'en', name: 'Satkhira' },
          { locale: 'bn', name: 'সাতক্ষীরা' },
        ],
      },
    ],
  },
  {
    code: 'BD-E',
    sortOrder: 5,
    translations: [
      { locale: 'en', name: 'Rajshahi' },
      { locale: 'bn', name: 'রাজশাহী' },
    ],
    districts: [
      {
        code: 'BD-42',
        sortOrder: 1,
        translations: [
          { locale: 'en', name: 'Bogra' },
          { locale: 'bn', name: 'বগুড়া' },
        ],
      },
      {
        code: 'BD-43',
        sortOrder: 2,
        translations: [
          { locale: 'en', name: 'Joypurhat' },
          { locale: 'bn', name: 'জয়পুরহাট' },
        ],
      },
      {
        code: 'BD-44',
        sortOrder: 3,
        translations: [
          { locale: 'en', name: 'Naogaon' },
          { locale: 'bn', name: 'নওগাঁ' },
        ],
      },
      {
        code: 'BD-45',
        sortOrder: 4,
        translations: [
          { locale: 'en', name: 'Natore' },
          { locale: 'bn', name: 'নাটোর' },
        ],
      },
      {
        code: 'BD-46',
        sortOrder: 5,
        translations: [
          { locale: 'en', name: 'Nawabganj' },
          { locale: 'bn', name: 'নবাবগঞ্জ' },
        ],
      },
      {
        code: 'BD-47',
        sortOrder: 6,
        translations: [
          { locale: 'en', name: 'Pabna' },
          { locale: 'bn', name: 'পাবনা' },
        ],
      },
      {
        code: 'BD-48',
        sortOrder: 7,
        translations: [
          { locale: 'en', name: 'Rajshahi' },
          { locale: 'bn', name: 'রাজশাহী' },
        ],
      },
      {
        code: 'BD-49',
        sortOrder: 8,
        translations: [
          { locale: 'en', name: 'Sirajganj' },
          { locale: 'bn', name: 'সিরাজগঞ্জ' },
        ],
      },
    ],
  },
  {
    code: 'BD-F',
    sortOrder: 6,
    translations: [
      { locale: 'en', name: 'Rangpur' },
      { locale: 'bn', name: 'রংপুর' },
    ],
    districts: [
      {
        code: 'BD-50',
        sortOrder: 1,
        translations: [
          { locale: 'en', name: 'Dinajpur' },
          { locale: 'bn', name: 'দিনাজপুর' },
        ],
      },
      {
        code: 'BD-51',
        sortOrder: 2,
        translations: [
          { locale: 'en', name: 'Gaibandha' },
          { locale: 'bn', name: 'গাইবান্ধা' },
        ],
      },
      {
        code: 'BD-52',
        sortOrder: 3,
        translations: [
          { locale: 'en', name: 'Kurigram' },
          { locale: 'bn', name: 'কুড়িগ্রাম' },
        ],
      },
      {
        code: 'BD-53',
        sortOrder: 4,
        translations: [
          { locale: 'en', name: 'Lalmonirhat' },
          { locale: 'bn', name: 'লালমনিরহাট' },
        ],
      },
      {
        code: 'BD-54',
        sortOrder: 5,
        translations: [
          { locale: 'en', name: 'Nilphamari' },
          { locale: 'bn', name: 'নীলফামারী' },
        ],
      },
      {
        code: 'BD-55',
        sortOrder: 6,
        translations: [
          { locale: 'en', name: 'Panchagarh' },
          { locale: 'bn', name: 'পঞ্চগড়' },
        ],
      },
      {
        code: 'BD-56',
        sortOrder: 7,
        translations: [
          { locale: 'en', name: 'Rangpur' },
          { locale: 'bn', name: 'রংপুর' },
        ],
      },
      {
        code: 'BD-57',
        sortOrder: 8,
        translations: [
          { locale: 'en', name: 'Thakurgaon' },
          { locale: 'bn', name: 'ঠাকুরগাঁও' },
        ],
      },
    ],
  },
  {
    code: 'BD-G',
    sortOrder: 7,
    translations: [
      { locale: 'en', name: 'Sylhet' },
      { locale: 'bn', name: 'সিলেট' },
    ],
    districts: [
      {
        code: 'BD-58',
        sortOrder: 1,
        translations: [
          { locale: 'en', name: 'Habiganj' },
          { locale: 'bn', name: 'হবিগঞ্জ' },
        ],
      },
      {
        code: 'BD-59',
        sortOrder: 2,
        translations: [
          { locale: 'en', name: 'Moulvibazar' },
          { locale: 'bn', name: 'মৌলভীবাজার' },
        ],
      },
      {
        code: 'BD-60',
        sortOrder: 3,
        translations: [
          { locale: 'en', name: 'Sunamganj' },
          { locale: 'bn', name: 'সুনামগঞ্জ' },
        ],
      },
      {
        code: 'BD-61',
        sortOrder: 4,
        translations: [
          { locale: 'en', name: 'Sylhet' },
          { locale: 'bn', name: 'সিলেট' },
        ],
      },
    ],
  },
  {
    code: 'BD-H',
    sortOrder: 8,
    translations: [
      { locale: 'en', name: 'Mymensingh' },
      { locale: 'bn', name: 'ময়মনসিংহ' },
    ],
    districts: [
      {
        code: 'BD-62',
        sortOrder: 1,
        translations: [
          { locale: 'en', name: 'Jamalpur' },
          { locale: 'bn', name: 'জামালপুর' },
        ],
      },
      {
        code: 'BD-63',
        sortOrder: 2,
        translations: [
          { locale: 'en', name: 'Netrokona' },
          { locale: 'bn', name: 'নেত্রকোণা' },
        ],
      },
      {
        code: 'BD-64',
        sortOrder: 3,
        translations: [
          { locale: 'en', name: 'Sherpur' },
          { locale: 'bn', name: 'শেরপুর' },
        ],
      },
    ],
  },
];

/**
 * Upsert a division by code.
 * - First run: inserts
 * - Subsequent runs: returns existing
 * - If sortOrder changed: updates
 */
async function upsertDivision(code: string, sortOrder: number) {
  const [inserted] = await db
    .insert(schema.divisionsTable)
    .values({ code, sortOrder })
    .onConflictDoUpdate({
      target: schema.divisionsTable.code,
      set: { sortOrder },
    })
    .returning();

  return inserted;
}

/**
 * Upsert a district by code.
 * - First run: inserts
 * - Subsequent runs: returns existing
 * - If sortOrder or divisionId changed: updates
 */
async function upsertDistrict(
  code: string,
  divisionId: string,
  sortOrder: number,
) {
  const [inserted] = await db
    .insert(schema.districtsTable)
    .values({ code, divisionId, sortOrder })
    .onConflictDoUpdate({
      target: schema.districtsTable.code,
      set: { divisionId, sortOrder },
    })
    .returning();

  return inserted;
}

/**
 * Upsert a division translation.
 * - First run: inserts
 * - Subsequent runs: updates name if changed
 */
async function upsertDivisionTranslation(
  divisionId: string,
  locale: string,
  name: string,
) {
  await db
    .insert(schema.divisionTranslationsTable)
    .values({ divisionId, locale, name })
    .onConflictDoUpdate({
      target: [
        schema.divisionTranslationsTable.divisionId,
        schema.divisionTranslationsTable.locale,
      ],
      set: { name },
    })
    .execute();
}

/**
 * Upsert a district translation.
 * - First run: inserts
 * - Subsequent runs: updates name if changed
 */
async function upsertDistrictTranslation(
  districtId: string,
  locale: string,
  name: string,
) {
  await db
    .insert(schema.districtTranslationsTable)
    .values({ districtId, locale, name })
    .onConflictDoUpdate({
      target: [
        schema.districtTranslationsTable.districtId,
        schema.districtTranslationsTable.locale,
      ],
      set: { name },
    })
    .execute();
}

async function seedDivisionsAndDistricts() {
  console.log('🌱 Seeding Bangladesh divisions and districts...');

  try {
    // Collect all codes from seed data for cleanup
    const allDivisionCodes = DIVISIONS_DATA.map((d) => d.code);
    const allDistrictCodes: string[] = [];

    for (const divisionData of DIVISIONS_DATA) {
      for (const districtData of divisionData.districts) {
        allDistrictCodes.push(districtData.code);
      }
    }

    // === CLEANUP: Remove districts not in seed data ===
    // (cascade deletes their translations automatically)
    const districtsToRemove = await db
      .select({
        id: schema.districtsTable.id,
        code: schema.districtsTable.code,
      })
      .from(schema.districtsTable)
      .where(notInArray(schema.districtsTable.code, allDistrictCodes));

    if (districtsToRemove.length > 0) {
      console.log(
        `🧹 Removing ${districtsToRemove.length} districts not in seed data...`,
      );
      await db.delete(schema.districtsTable).where(
        inArray(
          schema.districtsTable.code,
          districtsToRemove.map((d) => d.code),
        ),
      );
    }

    // === CLEANUP: Remove divisions not in seed data ===
    // (cascade deletes their districts and translations automatically)
    const divisionsToRemove = await db
      .select({
        id: schema.divisionsTable.id,
        code: schema.divisionsTable.code,
      })
      .from(schema.divisionsTable)
      .where(notInArray(schema.divisionsTable.code, allDivisionCodes));

    if (divisionsToRemove.length > 0) {
      console.log(
        `🧹 Removing ${divisionsToRemove.length} divisions not in seed data...`,
      );
      await db.delete(schema.divisionsTable).where(
        inArray(
          schema.divisionsTable.code,
          divisionsToRemove.map((d) => d.code),
        ),
      );
    }

    // === SEED: Insert/update divisions and districts ===
    let totalDivisions = 0;
    let totalDistricts = 0;

    for (const divisionData of DIVISIONS_DATA) {
      const division = await upsertDivision(
        divisionData.code,
        divisionData.sortOrder,
      );
      if (!division) {
        console.warn(`⚠️  Could not upsert division: ${divisionData.code}`);
        continue;
      }

      totalDivisions++;
      const enName = divisionData.translations.find(
        (t) => t.locale === 'en',
      )!.name;
      console.log(`✅ Division: ${enName} (${divisionData.code})`);

      // Upsert division translations
      for (const trans of divisionData.translations) {
        await upsertDivisionTranslation(division.id, trans.locale, trans.name);
      }

      // Seed districts within this division
      for (const districtData of divisionData.districts) {
        const district = await upsertDistrict(
          districtData.code,
          division.id,
          districtData.sortOrder,
        );
        if (!district) {
          console.warn(`  ⚠️  Could not upsert district: ${districtData.code}`);
          continue;
        }

        totalDistricts++;

        // Upsert district translations
        for (const trans of districtData.translations) {
          await upsertDistrictTranslation(
            district.id,
            trans.locale,
            trans.name,
          );
        }
      }
    }

    console.log(
      `✨ Division & district seeding completed: ${totalDivisions} divisions, ${totalDistricts} districts`,
    );
  } catch (error) {
    console.error('❌ Division & district seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedDivisionsAndDistricts()
    .catch(console.error)
    .finally(() => process.exit(0));
}

export { seedDivisionsAndDistricts };

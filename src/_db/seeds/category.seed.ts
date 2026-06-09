import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, sql, and } from 'drizzle-orm';
import * as schema from '../drizzle/schema';

// Load environment variables
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

// Create pool connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const db = drizzle(pool, { schema });

// Plant categories as specified in Phase 1 plan
const PLANT_CATEGORIES = [
  // Indoor Plants (with children)
  {
    slug: 'indoor-plants',
    translations: [
      {
        locale: 'en',
        name: 'Indoor Plants',
        description: 'Plants perfect for inside your home or office',
      },
      {
        locale: 'bn',
        name: 'ইনডোর উদ্ভিদ',
        description: 'আপনার বাড়ি বা অফিসের জন্য নিখুঁত উদ্ভিদ',
      },
    ],
    children: [
      {
        slug: 'flowering-indoor',
        translations: [
          {
            locale: 'en',
            name: 'Flowering Indoor',
            description: 'Indoor plants that produce beautiful flowers',
          },
          {
            locale: 'bn',
            name: 'ফুল ফোটানো ইনডোর',
            description: 'সুন্দর ফুল উৎপাদনকারী ইনডোর উদ্ভিদ',
          },
        ],
      },
      {
        slug: 'foliage-plants',
        translations: [
          {
            locale: 'en',
            name: 'Foliage Plants',
            description: 'Plants grown for their attractive leaves',
          },
          {
            locale: 'bn',
            name: 'পাতার উদ্ভিদ',
            description: 'আকর্ষণীয় পাতার জন্য চাষ করা উদ্ভিদ',
          },
        ],
      },
      {
        slug: 'air-purifying',
        translations: [
          {
            locale: 'en',
            name: 'Air Purifying',
            description: 'Plants that help clean the air in your home',
          },
          {
            locale: 'bn',
            name: 'বায়ু পরিশোধক',
            description:
              'আপনার বাড়ির বায়ু পরিষ্কার করতে সাহায্য করে এমন উদ্ভিদ',
          },
        ],
      },
    ],
  },
  // Outdoor Plants (with children)
  {
    slug: 'outdoor-plants',
    translations: [
      {
        locale: 'en',
        name: 'Outdoor Plants',
        description: 'Plants suitable for gardens and outdoor spaces',
      },
      {
        locale: 'bn',
        name: 'আউটডোর উদ্ভিদ',
        description: 'বাগান এবং খোলা জায়গার জন্য উপযুক্ত উদ্ভিদ',
      },
    ],
    children: [
      {
        slug: 'garden-flowers',
        translations: [
          {
            locale: 'en',
            name: 'Garden Flowers',
            description: 'Flowers perfect for your garden',
          },
          {
            locale: 'bn',
            name: 'বাগানের ফুল',
            description: 'আপনার বাগানের জন্য নিখুঁত ফুল',
          },
        ],
      },
      {
        slug: 'shrubs-bushes',
        translations: [
          {
            locale: 'en',
            name: 'Shrubs & Bushes',
            description: 'Woody plants perfect for hedges and borders',
          },
          {
            locale: 'bn',
            name: 'গুল্ম ও ঝাড়',
            description: 'বেড়া এবং সীমানার জন্য নিখুঁত কাঠের উদ্ভিদ',
          },
        ],
      },
      {
        slug: 'trees',
        translations: [
          {
            locale: 'en',
            name: 'Trees',
            description: 'Large plants that provide shade and beauty',
          },
          {
            locale: 'bn',
            name: 'গাছ',
            description: 'ছায়া এবং সৌন্দর্য প্রদানকারী বড় উদ্ভিদ',
          },
        ],
      },
    ],
  },
  // Succulents (with children)
  {
    slug: 'succulents',
    translations: [
      {
        locale: 'en',
        name: 'Succulents',
        description:
          'Water-storing plants perfect for low maintenance gardening',
      },
      {
        locale: 'bn',
        name: 'সাকুলেন্ট',
        description:
          'কম রক্ষণাবেক্ষণের বাগানের জন্য নিখুঁত জল সংরক্ষণকারী উদ্ভিদ',
      },
    ],
    children: [
      {
        slug: 'desert-succulents',
        translations: [
          {
            locale: 'en',
            name: 'Desert Succulents',
            description: 'Succulents adapted to arid climates',
          },
          {
            locale: 'bn',
            name: 'মরুভূমি সাকুলেন্ট',
            description: 'শুষ্ক জলবায়ুর সাথে খাপ খাওয়ানো সাকুলেন্ট',
          },
        ],
      },
      {
        slug: 'tropical-succulents',
        translations: [
          {
            locale: 'en',
            name: 'Tropical Succulents',
            description: 'Succulents from tropical regions',
          },
          {
            locale: 'bn',
            name: 'ট্রোপিক্যাল সাকুলেন্ট',
            description: 'ট্রোপিকাল অঞ্চলের সাকুলেন্ট',
          },
        ],
      },
    ],
  },
  // Exotic Plants (no children)
  {
    slug: 'exotic-plants',
    translations: [
      {
        locale: 'en',
        name: 'Exotic Plants',
        description: 'Rare and unusual plants from around the world',
      },
      {
        locale: 'bn',
        name: 'বহিরাগত উদ্ভিদ',
        description: 'বিশ্বের বিরল এবং অসাধারণ উদ্ভিদ',
      },
    ],
  },
  // Herbs & Medicinal (no children)
  {
    slug: 'herbs-medicinal',
    translations: [
      {
        locale: 'en',
        name: 'Herbs & Medicinal',
        description: 'Plants used for cooking and traditional medicine',
      },
      {
        locale: 'bn',
        name: 'ভেষজ ও ঔষধি',
        description: 'রান্না এবং ঐতিহ্যবাহী ঔষধের জন্য ব্যবহৃত উদ্ভিদ',
      },
    ],
  },
  // Seasonal Plants (no children)
  {
    slug: 'seasonal-plants',
    translations: [
      {
        locale: 'en',
        name: 'Seasonal Plants',
        description: 'Plants that bloom in specific seasons',
      },
      {
        locale: 'bn',
        name: 'ঋতু ভিত্তিক উদ্ভিদ',
        description: 'নির্দিষ্ট ঋতুতে ফোটা উদ্ভিদ',
      },
    ],
  },
];

/**
 * Upsert a category: create if not exists, return existing if already seeded.
 */
async function upsertCategory(slug: string) {
  // Try to insert; if conflict, fetch existing
  const [inserted] = await db
    .insert(schema.categoriesTable)
    .values({
      slug,
      isActive: true,
      commissionRate: '10.00',
    })
    .onConflictDoNothing({ target: schema.categoriesTable.slug })
    .returning();

  if (inserted) {
    return inserted;
  }

  // Already exists — fetch it
  const existing = await db.query.categoriesTable.findFirst({
    where: eq(schema.categoriesTable.slug, slug),
  });

  return existing ?? null;
}

/**
 * Insert a self-reference (depth: 0) for a category into the closure table.
 * Required for closure table queries to work correctly.
 */
async function insertSelfReference(categoryId: string) {
  await db
    .insert(schema.categoryHierarchyTable)
    .values({
      ancestorId: categoryId,
      descendantId: categoryId,
      depth: 0,
    })
    .onConflictDoNothing()
    .execute();
}

/**
 * Insert a parent→child link (depth: 1) into the closure table.
 */
async function insertParentChildLink(parentId: string, childId: string) {
  await db
    .insert(schema.categoryHierarchyTable)
    .values({
      ancestorId: parentId,
      descendantId: childId,
      depth: 1,
    })
    .onConflictDoNothing()
    .execute();
}

async function seedCategories() {
  console.log('🌱 Seeding plant categories...');

  try {
    for (const categoryData of PLANT_CATEGORIES) {
      // Upsert parent category
      const category = await upsertCategory(categoryData.slug);
      if (!category) {
        console.warn(`⚠️  Could not upsert category: ${categoryData.slug}`);
        continue;
      }

      console.log(`✅ Category: ${category.slug} (${category.id})`);

      // Self-reference (depth: 0) — required for closure table
      await insertSelfReference(category.id);

      // Upsert translations for parent
      for (const trans of categoryData.translations) {
        await db
          .insert(schema.categoryTranslationsTable)
          .values({
            categoryId: category.id,
            locale: trans.locale,
            name: trans.name,
            description: trans.description,
          })
          .onConflictDoNothing()
          .execute();
      }

      // Create children if exist
      if (categoryData.children) {
        for (const childData of categoryData.children) {
          const childCategory = await upsertCategory(childData.slug);
          if (!childCategory) {
            console.warn(`⚠️  Could not upsert child: ${childData.slug}`);
            continue;
          }

          console.log(
            `  ✅ Child: ${childCategory.slug} (${childCategory.id})`,
          );

          // Self-reference for child (depth: 0)
          await insertSelfReference(childCategory.id);

          // Parent → child link (depth: 1)
          await insertParentChildLink(category.id, childCategory.id);

          // Update childrenCount on parent (idempotent: recalculate from hierarchy)
          const childCountResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(schema.categoryHierarchyTable)
            .where(
              and(
                eq(schema.categoryHierarchyTable.ancestorId, category.id),
                eq(schema.categoryHierarchyTable.depth, 1),
              ),
            );

          const childCount = childCountResult[0]?.count ?? 0;
          await db
            .update(schema.categoriesTable)
            .set({ childrenCount: childCount })
            .where(eq(schema.categoriesTable.id, category.id));

          // Upsert translations for child
          for (const trans of childData.translations) {
            await db
              .insert(schema.categoryTranslationsTable)
              .values({
                categoryId: childCategory.id,
                locale: trans.locale,
                name: trans.name,
                description: trans.description,
              })
              .onConflictDoNothing()
              .execute();
          }
        }
      }
    }

    console.log('✨ Category seeding completed successfully!');
  } catch (error) {
    console.error('❌ Category seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if this is the main module
if (require.main === module) {
  seedCategories()
    .catch(console.error)
    .finally(() => process.exit(0));
}

export { seedCategories };

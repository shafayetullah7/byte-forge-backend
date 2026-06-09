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

// Tag groups with their tags and translations
const TAG_DATA = [
  {
    slug: 'light-requirements',
    translations: [
      {
        locale: 'en',
        name: 'Light Requirements',
        description: 'Tags for light preference and tolerance',
      },
      {
        locale: 'bn',
        name: 'আলোর প্রয়োজনীয়তা',
        description: 'আলোর পছন্দ এবং সহনশীলতার জন্য ট্যাগ',
      },
    ],
    tags: [
      {
        slug: 'low-light',
        translations: [
          {
            locale: 'en',
            name: 'Low Light',
            description: 'Thrives in low light conditions',
          },
          {
            locale: 'bn',
            name: 'কম আলো',
            description: 'কম আলোয় ভালোভাবে বৃদ্ধি পায়',
          },
        ],
      },
      {
        slug: 'bright-indirect',
        translations: [
          {
            locale: 'en',
            name: 'Bright Indirect',
            description: 'Needs bright indirect light',
          },
          {
            locale: 'bn',
            name: 'উজ্জ্বল পরোক্ষ আলো',
            description: 'উজ্জ্বল পরোক্ষ আলো প্রয়োজন',
          },
        ],
      },
      {
        slug: 'direct-sun',
        translations: [
          {
            locale: 'en',
            name: 'Direct Sun',
            description: 'Can tolerate direct sunlight',
          },
          {
            locale: 'bn',
            name: 'সরাসরি সূর্যালোক',
            description: 'সরাসরি সূর্যালোক সহ্য করতে পারে',
          },
        ],
      },
      {
        slug: 'full-shade',
        translations: [
          {
            locale: 'en',
            name: 'Full Shade',
            description: 'Prefers complete shade',
          },
          {
            locale: 'bn',
            name: 'সম্পূর্ণ ছায়া',
            description: 'সম্পূর্ণ ছায়া পছন্দ করে',
          },
        ],
      },
    ],
  },
  {
    slug: 'watering-needs',
    translations: [
      {
        locale: 'en',
        name: 'Watering Needs',
        description: 'Tags for watering frequency and requirements',
      },
      {
        locale: 'bn',
        name: 'সিঞ্চনের প্রয়োজনীয়তা',
        description: 'সিঞ্চনের কম্প্রতা এবং প্রয়োজনীয়তার জন্য ট্যাগ',
      },
    ],
    tags: [
      {
        slug: 'daily-watering',
        translations: [
          {
            locale: 'en',
            name: 'Daily Watering',
            description: 'Requires watering every day',
          },
          {
            locale: 'bn',
            name: 'প্রতিদিন পানি',
            description: 'প্রতিদিন পানি প্রয়োজন',
          },
        ],
      },
      {
        slug: 'weekly-watering',
        translations: [
          {
            locale: 'en',
            name: 'Weekly Watering',
            description: 'Needs watering once a week',
          },
          {
            locale: 'bn',
            name: 'সাপ্তাহিক পানি',
            description: 'সপ্তাহে একবার পানি প্রয়োজন',
          },
        ],
      },
      {
        slug: 'bi-weekly',
        translations: [
          {
            locale: 'en',
            name: 'Bi-Weekly',
            description: 'Water every two weeks',
          },
          {
            locale: 'bn',
            name: 'দুই সপ্তাহে একবার',
            description: 'দুই সপ্তাহে একবার পানি দিন',
          },
        ],
      },
      {
        slug: 'monthly',
        translations: [
          { locale: 'en', name: 'Monthly', description: 'Water once a month' },
          { locale: 'bn', name: 'মাসিক', description: 'মাসে একবার পানি দিন' },
        ],
      },
      {
        slug: 'drought-tolerant',
        translations: [
          {
            locale: 'en',
            name: 'Drought Tolerant',
            description: 'Can survive extended dry periods',
          },
          {
            locale: 'bn',
            name: 'খরা সহনশীল',
            description: 'দীর্ঘ শুষ্ক সময় টিকে থাকতে পারে',
          },
        ],
      },
    ],
  },
  {
    slug: 'humidity-preferences',
    translations: [
      {
        locale: 'en',
        name: 'Humidity Preferences',
        description: 'Tags for humidity level preferences',
      },
      {
        locale: 'bn',
        name: 'আর্দ্রতার পছন্দ',
        description: 'আর্দ্রতার স্তরের পছন্দের জন্য ট্যাগ',
      },
    ],
    tags: [
      {
        slug: 'low-humidity',
        translations: [
          {
            locale: 'en',
            name: 'Low Humidity',
            description: 'Thrives in dry air conditions',
          },
          {
            locale: 'bn',
            name: 'কম আর্দ্রতা',
            description: 'শুষ্ক বাতাসে ভালোভাবে বৃদ্ধি পায়',
          },
        ],
      },
      {
        slug: 'medium-humidity',
        translations: [
          {
            locale: 'en',
            name: 'Medium Humidity',
            description: 'Prefers moderate humidity levels',
          },
          {
            locale: 'bn',
            name: 'মাঝারি আর্দ্রতা',
            description: 'মাঝারি আর্দ্রতা স্তর পছন্দ করে',
          },
        ],
      },
      {
        slug: 'high-humidity',
        translations: [
          {
            locale: 'en',
            name: 'High Humidity',
            description: 'Needs high humidity to thrive',
          },
          {
            locale: 'bn',
            name: 'উচ্চ আর্দ্রতা',
            description: 'ভালোভাবে বৃদ্ধির জন্য উচ্চ আর্দ্রতা প্রয়োজন',
          },
        ],
      },
    ],
  },
  {
    slug: 'care-difficulty',
    translations: [
      {
        locale: 'en',
        name: 'Care Difficulty',
        description: 'Tags for plant care difficulty level',
      },
      {
        locale: 'bn',
        name: 'যত্নের জটিলতা',
        description: 'উদ্ভিদের যত্নের জটিলতার স্তরের জন্য ট্যাগ',
      },
    ],
    tags: [
      {
        slug: 'beginner-friendly',
        translations: [
          {
            locale: 'en',
            name: 'Beginner Friendly',
            description: 'Easy to care for, perfect for beginners',
          },
          {
            locale: 'bn',
            name: 'শুরুকারীদের জন্য উপযোগী',
            description: 'যত্ন করা সহজ, শুরুকারীদের জন্য নিখুঁত',
          },
        ],
      },
      {
        slug: 'intermediate',
        translations: [
          {
            locale: 'en',
            name: 'Intermediate',
            description: 'Requires some experience',
          },
          {
            locale: 'bn',
            name: 'মাঝারি',
            description: 'কিছু অভিজ্ঞতা প্রয়োজন',
          },
        ],
      },
      {
        slug: 'expert-only',
        translations: [
          {
            locale: 'en',
            name: 'Expert Only',
            description: 'Advanced care required',
          },
          {
            locale: 'bn',
            name: 'বিশেষজ্ঞদের জন্য',
            description: 'উন্নত যত্ন প্রয়োজন',
          },
        ],
      },
    ],
  },
  {
    slug: 'growth-characteristics',
    translations: [
      {
        locale: 'en',
        name: 'Growth Characteristics',
        description: 'Tags for growth rate and plant size',
      },
      {
        locale: 'bn',
        name: 'বৃদ্ধির বৈশিষ্ট্য',
        description: 'বৃদ্ধির হার এবং উদ্ভিদের আকারের জন্য ট্যাগ',
      },
    ],
    tags: [
      {
        slug: 'fast-growing',
        translations: [
          { locale: 'en', name: 'Fast Growing', description: 'Grows quickly' },
          {
            locale: 'bn',
            name: 'দ্রুত বর্ধনশীল',
            description: 'দ্রুত বৃদ্ধি পায়',
          },
        ],
      },
      {
        slug: 'moderate-growth',
        translations: [
          {
            locale: 'en',
            name: 'Moderate Growth',
            description: 'Steady moderate growth rate',
          },
          {
            locale: 'bn',
            name: 'মাঝারি বৃদ্ধি',
            description: 'স্থির মাঝারি বৃদ্ধির হার',
          },
        ],
      },
      {
        slug: 'slow-growing',
        translations: [
          {
            locale: 'en',
            name: 'Slow Growing',
            description: 'Grows slowly over time',
          },
          {
            locale: 'bn',
            name: 'ধীরে বর্ধনশীল',
            description: 'সময়ের সাথে সাথে ধীরে বৃদ্ধি পায়',
          },
        ],
      },
      {
        slug: 'compact',
        translations: [
          {
            locale: 'en',
            name: 'Compact',
            description: 'Stays small and compact',
          },
          {
            locale: 'bn',
            name: 'কমপ্যাক্ট',
            description: 'ছোট এবং কমপ্যাক্ট থাকে',
          },
        ],
      },
      {
        slug: 'large-plant',
        translations: [
          {
            locale: 'en',
            name: 'Large Plant',
            description: 'Can grow to large sizes',
          },
          {
            locale: 'bn',
            name: 'বড় উদ্ভিদ',
            description: 'বড় আকারে বৃদ্ধি পেতে পারে',
          },
        ],
      },
    ],
  },
  {
    slug: 'pet-safety',
    translations: [
      {
        locale: 'en',
        name: 'Pet Safety',
        description: 'Tags for pet and child safety information',
      },
      {
        locale: 'bn',
        name: 'পোষ্য প্রাণী নিরাপত্তা',
        description: 'পোষ্য প্রাণী এবং শিশু নিরাপত্তা তথ্যের জন্য ট্যাগ',
      },
    ],
    tags: [
      {
        slug: 'pet-safe',
        translations: [
          { locale: 'en', name: 'Pet Safe', description: 'Non-toxic to pets' },
          {
            locale: 'bn',
            name: 'পোষ্য প্রাণী নিরাপদ',
            description: 'পোষ্য প্রাণীদের জন্য অবিষাক্ত',
          },
        ],
      },
      {
        slug: 'toxic-to-pets',
        translations: [
          {
            locale: 'en',
            name: 'Toxic to Pets',
            description: 'Can be harmful if ingested by pets',
          },
          {
            locale: 'bn',
            name: 'পোষ্য প্রাণীদের জন্য বিষাক্ত',
            description: 'পোষ্য প্রাণীরা খেলে ক্ষতিকর হতে পারে',
          },
        ],
      },
      {
        slug: 'child-safe',
        translations: [
          {
            locale: 'en',
            name: 'Child Safe',
            description: 'Safe around children',
          },
          {
            locale: 'bn',
            name: 'শিশু নিরাপদ',
            description: 'শিশুদের আশেপাশে নিরাপদ',
          },
        ],
      },
    ],
  },
  {
    slug: 'special-features',
    translations: [
      {
        locale: 'en',
        name: 'Special Features',
        description: 'Tags for unique plant characteristics',
      },
      {
        locale: 'bn',
        name: 'বিশেষ বৈশিষ্ট্য',
        description: 'অনন্য উদ্ভিদের বৈশিষ্ট্যের জন্য ট্যাগ',
      },
    ],
    tags: [
      {
        slug: 'air-purifying',
        translations: [
          {
            locale: 'en',
            name: 'Air Purifying',
            description: 'Helps clean indoor air',
          },
          {
            locale: 'bn',
            name: 'বায়ু পরিশোধক',
            description: 'ইনডোর বায়ু পরিষ্কার করতে সাহায্য করে',
          },
        ],
      },
      {
        slug: 'flowering',
        translations: [
          {
            locale: 'en',
            name: 'Flowering',
            description: 'Produces beautiful flowers',
          },
          {
            locale: 'bn',
            name: 'ফুল ফোটানো',
            description: 'সুন্দর ফুল উৎপাদন করে',
          },
        ],
      },
      {
        slug: 'fragrant',
        translations: [
          {
            locale: 'en',
            name: 'Fragrant',
            description: 'Produces pleasant fragrance',
          },
          {
            locale: 'bn',
            name: 'সুগন্ধি',
            description: 'মনোরম সুগন্ধ উৎপাদন করে',
          },
        ],
      },
      {
        slug: 'edible',
        translations: [
          {
            locale: 'en',
            name: 'Edible',
            description: 'Parts of the plant are edible',
          },
          {
            locale: 'bn',
            name: 'খাযোগ্য',
            description: 'উদ্ভিদের অংশ খাওয়া যায়',
          },
        ],
      },
      {
        slug: 'medicinal',
        translations: [
          {
            locale: 'en',
            name: 'Medicinal',
            description: 'Has medicinal properties',
          },
          { locale: 'bn', name: 'ঔষধি', description: 'ঔষধি বৈশিষ্ট্য রয়েছে' },
        ],
      },
      {
        slug: 'variegated',
        translations: [
          {
            locale: 'en',
            name: 'Variegated',
            description: 'Has multi-colored leaves',
          },
          {
            locale: 'bn',
            name: 'রঙিন পাতা',
            description: 'বহু-রঙা পাতা রয়েছে',
          },
        ],
      },
      {
        slug: 'trailing',
        translations: [
          {
            locale: 'en',
            name: 'Trailing',
            description: 'Grows trailing/hanging',
          },
          {
            locale: 'bn',
            name: 'ঝুলন্ত',
            description: 'ঝুলন্ত/লটকানোভাবে বৃদ্ধি পায়',
          },
        ],
      },
      {
        slug: 'climbing',
        translations: [
          {
            locale: 'en',
            name: 'Climbing',
            description: 'Grows by climbing surfaces',
          },
          { locale: 'bn', name: 'ওঠা', description: 'পৃষ্ঠতল বেয়ে ওঠে' },
        ],
      },
    ],
  },
  {
    slug: 'seasonal',
    translations: [
      {
        locale: 'en',
        name: 'Seasonal',
        description: 'Tags for seasonal blooming and characteristics',
      },
      {
        locale: 'bn',
        name: 'ঋতুভিত্তিক',
        description: 'ঋতুভিত্তিক ফোটা এবং বৈশিষ্ট্যের জন্য ট্যাগ',
      },
    ],
    tags: [
      {
        slug: 'spring-bloomer',
        translations: [
          {
            locale: 'en',
            name: 'Spring Bloomer',
            description: 'Blooms in spring season',
          },
          {
            locale: 'bn',
            name: 'বসন্তে ফোটে',
            description: 'বসন্ত ঋতুতে ফোটে',
          },
        ],
      },
      {
        slug: 'summer-bloomer',
        translations: [
          {
            locale: 'en',
            name: 'Summer Bloomer',
            description: 'Blooms in summer season',
          },
          {
            locale: 'bn',
            name: 'গ্রীষ্মে ফোটে',
            description: 'গ্রীষ্ম ঋতুতে ফোটে',
          },
        ],
      },
      {
        slug: 'fall-bloomer',
        translations: [
          {
            locale: 'en',
            name: 'Fall Bloomer',
            description: 'Blooms in autumn season',
          },
          { locale: 'bn', name: 'শরতে ফোটে', description: 'শরৎ ঋতুতে ফোটে' },
        ],
      },
      {
        slug: 'year-round',
        translations: [
          {
            locale: 'en',
            name: 'Year Round',
            description: 'Blooms or stays green all year',
          },
          {
            locale: 'bn',
            name: 'সারাবছর',
            description: 'সারা বছর ফোটে বা সবুজ থাকে',
          },
        ],
      },
    ],
  },
  {
    slug: 'usage-purpose',
    translations: [
      {
        locale: 'en',
        name: 'Usage & Purpose',
        description: 'Tags for how the plant is used',
      },
      {
        locale: 'bn',
        name: 'ব্যবহার এবং উদ্দেশ্য',
        description: 'উদ্ভিদ কীভাবে ব্যবহৃত হয় তার জন্য ট্যাগ',
      },
    ],
    tags: [
      {
        slug: 'indoor-decoration',
        translations: [
          {
            locale: 'en',
            name: 'Indoor Decoration',
            description: 'Great for indoor decor',
          },
          {
            locale: 'bn',
            name: 'ইনডোর সাজসজ্জা',
            description: 'ইনডোর সাজসজ্জার জন্য দুর্দান্ত',
          },
        ],
      },
      {
        slug: 'outdoor-garden',
        translations: [
          {
            locale: 'en',
            name: 'Outdoor Garden',
            description: 'Suitable for outdoor gardens',
          },
          {
            locale: 'bn',
            name: 'আউটডোর বাগান',
            description: 'আউটডোর বাগানের জন্য উপযুক্ত',
          },
        ],
      },
      {
        slug: 'bonsai',
        translations: [
          {
            locale: 'en',
            name: 'Bonsai',
            description: 'Can be grown as bonsai',
          },
          {
            locale: 'bn',
            name: 'বোনসাই',
            description: 'বোনসাই হিসেবে চাষ করা যায়',
          },
        ],
      },
      {
        slug: 'ground-cover',
        translations: [
          {
            locale: 'en',
            name: 'Ground Cover',
            description: 'Spreads to cover ground',
          },
          {
            locale: 'bn',
            name: 'ভূমি আবরণ',
            description: 'মাটি ঢাকতে ছড়িয়ে পড়ে',
          },
        ],
      },
      {
        slug: 'hedge',
        translations: [
          {
            locale: 'en',
            name: 'Hedge',
            description: 'Good for hedges and borders',
          },
          {
            locale: 'bn',
            name: 'বেড়া',
            description: 'বেড়া এবং সীমানার জন্য ভালো',
          },
        ],
      },
      {
        slug: 'container-friendly',
        translations: [
          {
            locale: 'en',
            name: 'Container Friendly',
            description: 'Thrives in pots and containers',
          },
          {
            locale: 'bn',
            name: 'কন্টেইনার উপযোগী',
            description: 'পট এবং কন্টেইনারে ভালোভাবে বৃদ্ধি পায়',
          },
        ],
      },
    ],
  },
];

/**
 * Upsert a tag group: create if not exists, return existing if already seeded.
 */
async function upsertTagGroup(slug: string) {
  const [inserted] = await db
    .insert(schema.tagGroupsTable)
    .values({ slug, isActive: true, tagCount: 0 })
    .onConflictDoNothing({ target: schema.tagGroupsTable.slug })
    .returning();

  if (inserted) return inserted;

  const existing = await db.query.tagGroupsTable.findFirst({
    where: eq(schema.tagGroupsTable.slug, slug),
  });

  return existing ?? null;
}

/**
 * Upsert a tag: create if not exists, return existing if already seeded.
 */
async function upsertTag(slug: string, groupId: string) {
  const [inserted] = await db
    .insert(schema.tagsTable)
    .values({ slug, groupId, isActive: true, usageCount: 0 })
    .onConflictDoNothing({ target: schema.tagsTable.slug })
    .returning();

  if (inserted) return inserted;

  const existing = await db.query.tagsTable.findFirst({
    where: and(
      eq(schema.tagsTable.slug, slug),
      eq(schema.tagsTable.groupId, groupId),
    ),
  });

  return existing ?? null;
}

async function seedTags() {
  console.log('🏷️  Seeding tag groups and tags...');

  try {
    for (const groupData of TAG_DATA) {
      const group = await upsertTagGroup(groupData.slug);
      if (!group) {
        console.warn(`⚠️  Could not upsert tag group: ${groupData.slug}`);
        continue;
      }

      console.log(`✅ Tag Group: ${group.slug} (${group.id})`);

      // Upsert translations for tag group
      for (const trans of groupData.translations) {
        await db
          .insert(schema.tagGroupTranslationsTable)
          .values({
            groupId: group.id,
            locale: trans.locale,
            name: trans.name,
            description: trans.description,
          })
          .onConflictDoNothing()
          .execute();
      }

      // Create tags within the group
      let tagCount = 0;
      for (const tagData of groupData.tags) {
        const tag = await upsertTag(tagData.slug, group.id);
        if (!tag) {
          console.warn(`  ⚠️  Could not upsert tag: ${tagData.slug}`);
          continue;
        }

        console.log(`  ✅ Tag: ${tag.slug} (${tag.id})`);
        tagCount++;

        // Upsert translations for tag
        for (const trans of tagData.translations) {
          await db
            .insert(schema.tagTranslationsTable)
            .values({
              tagId: tag.id,
              locale: trans.locale,
              name: trans.name,
              description: trans.description,
            })
            .onConflictDoNothing()
            .execute();
        }
      }

      // Update tag count on group
      if (tagCount > 0) {
        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.tagsTable)
          .where(
            and(
              eq(schema.tagsTable.groupId, group.id),
              eq(schema.tagsTable.isActive, true),
            ),
          );

        const actualCount = countResult[0]?.count ?? 0;
        await db
          .update(schema.tagGroupsTable)
          .set({ tagCount: actualCount })
          .where(eq(schema.tagGroupsTable.id, group.id));
      }
    }

    console.log('✨ Tag seeding completed successfully!');
  } catch (error) {
    console.error('❌ Tag seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if this is the main module
if (require.main === module) {
  seedTags()
    .catch(console.error)
    .finally(() => process.exit(0));
}

export { seedTags };

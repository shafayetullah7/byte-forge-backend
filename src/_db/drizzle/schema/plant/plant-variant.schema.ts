import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { plantTable } from './plant.schema';
import { plantVariantTranslationsTable } from './plant-variant-translation.schema';

/**
 * Plant Variant Table
 *
 * Stores variant data with English as the default locale.
 * String fields contain English/canonical values used for:
 * - Display in English locale
 * - Database filtering (language-agnostic)
 *
 * For non-English locales, join with plantVariantTranslationsTable.
 *
 * @see plantVariantTranslationsTable for translated display labels
 */
export const plantVariantTable = pgTable('plant_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  plantId: uuid('plant_id')
    .references(() => plantTable.id, { onDelete: 'cascade' })
    .notNull(),
  /**
   * Variant name in English (canonical value).
   * Examples: "small", "medium", "large", "rooted-cutting"
   * For other locales, see plantVariantTranslationsTable.name
   */
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }),

  // Differentiating Attributes (Individual typed fields)
  // These store English/canonical values for filtering and display
  potSize: varchar('pot_size', { length: 50 }),
  /**
   * Growth stage canonical value.
   * Examples: "seedling", "young", "mature", "flowering"
   * For other locales, see plantVariantTranslationsTable.growthStage
   */
  growthStage: varchar('growth_stage', { length: 50 }),
  /**
   * Propagation type canonical value.
   * Examples: "cutting", "seed", "division", "layering"
   * For other locales, see plantVariantTranslationsTable.propagationType
   */
  propagationType: varchar('propagation_type', { length: 50 }),
  /**
   * Plant form canonical value.
   * Examples: "upright", "trailing", "climbing", "bushy"
   * For other locales, see plantVariantTranslationsTable.plantForm
   */
  plantForm: varchar('plant_form', { length: 50 }),
  /**
   * Variegation type canonical value.
   * Examples: "solid", "variegated", "mottled", "margined"
   * For other locales, see plantVariantTranslationsTable.variegation
   */
  variegation: varchar('variegation', { length: 50 }),
  /**
   * Container type canonical value.
   * Examples: "nursery_pot", "decorative_pot", "hanging_basket"
   * For other locales, see plantVariantTranslationsTable.containerType
   */
  containerType: varchar('container_type', { length: 50 }),
  /**
   * Bundle type canonical value.
   * Examples: "single", "pair", "set_of_3", "collection"
   * For other locales, see plantVariantTranslationsTable.bundleType
   */
  bundleType: varchar('bundle_type', { length: 50 }),

  // Pricing (Moved from plant_pricing)
  price: integer('price').notNull().default(0), // Regular price in cents
  salePrice: integer('sale_price'), // Sale price in cents
  costPrice: integer('cost_price'), // Cost price for internal calculation

  // Inventory (Moved from plant_inventory)
  stockCount: integer('stock_count').notNull().default(0),
  trackQuantity: boolean('track_quantity').default(true).notNull(),
  lowStockAlert: integer('low_stock_alert').default(5),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TPlantVariant = typeof plantVariantTable.$inferSelect;
export type TNewPlantVariant = typeof plantVariantTable.$inferInsert;

export const plantVariantRelations = relations(
  plantVariantTable,
  ({ many }) => ({
    translations: many(plantVariantTranslationsTable),
  }),
);

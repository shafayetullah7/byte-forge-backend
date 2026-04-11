import { pgTable, uuid, integer, varchar } from 'drizzle-orm/pg-core';
import { plantTable } from './plant.schema';
import { plantVariantTable } from './plant-variant.schema';
import { mediaTable } from '../media';

export const plantMediaTable = pgTable('plant_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  plantId: uuid('plant_id')
    .references(() => plantTable.id, { onDelete: 'cascade' })
    .notNull(),
  variantId: uuid('variant_id').references(() => plantVariantTable.id, {
    onDelete: 'set null',
  }),
  mediaId: uuid('media_id')
    .references(() => mediaTable.id, { onDelete: 'cascade' })
    .notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  type: varchar('type', { length: 20 }).notNull().default('image'), // image, video
});

export type TPlantMedia = typeof plantMediaTable.$inferSelect;
export type TNewPlantMedia = typeof plantMediaTable.$inferInsert;

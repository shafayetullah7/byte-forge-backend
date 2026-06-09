import { pgTable, uuid, primaryKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { plantDetailsTable } from './plant-details.schema';
import { tagsTable } from '../taxonomy/tag.schema';

/**
 * Plant Details - Tag Linking Table
 *
 * Many-to-Many relationship between plant details and tags.
 * One plant can have many tags, one tag can be applied to many plants.
 */
export const plantDetailsTagsTable = pgTable(
  'plant_details_tags',
  {
    plantId: uuid('plant_id')
      .notNull()
      .references(() => plantDetailsTable.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tagsTable.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.plantId, t.tagId] }),
    index('plant_details_tags_plant_id_idx').on(t.plantId),
    index('plant_details_tags_tag_id_idx').on(t.tagId),
  ],
);

export type TPlantDetailsTags = typeof plantDetailsTagsTable.$inferSelect;
export type TNewPlantDetailsTags = typeof plantDetailsTagsTable.$inferInsert;

export const plantDetailsTagsRelations = relations(
  plantDetailsTagsTable,
  ({ one }) => ({
    plant: one(plantDetailsTable, {
      fields: [plantDetailsTagsTable.plantId],
      references: [plantDetailsTable.id],
    }),
    tag: one(tagsTable, {
      fields: [plantDetailsTagsTable.tagId],
      references: [tagsTable.id],
    }),
  }),
);

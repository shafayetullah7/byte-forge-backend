import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { categoryTranslationsTable, categoriesTable } from '@/_db/drizzle/schema/taxonomy';
import { eq, and, isNull } from 'drizzle-orm';
import { UpsertCategoryTranslationDto } from '../dto/upsert-category-translation.dto';

@Injectable()
export class AdminCategoryTranslationsService {
  constructor(private readonly db: DrizzleService) {}

  async findAllByCategory(categoryId: string) {
    // Verify category exists
    const category = await this.db.client.query.categoriesTable.findFirst({
      where: and(eq(categoriesTable.id, categoryId), isNull(categoriesTable.deletedAt)),
    });
    if (!category) throw new NotFoundException(`Category with ID ${categoryId} not found`);

    return await this.db.client
      .select()
      .from(categoryTranslationsTable)
      .where(eq(categoryTranslationsTable.categoryId, categoryId));
  }

  async upsert(categoryId: string, dto: UpsertCategoryTranslationDto) {
    const { locale, name, description } = dto;

    // Verify category exists
    const category = await this.db.client.query.categoriesTable.findFirst({
      where: and(eq(categoriesTable.id, categoryId), isNull(categoriesTable.deletedAt)),
    });
    if (!category) throw new NotFoundException(`Category with ID ${categoryId} not found`);

    const [translation] = await this.db.client
      .insert(categoryTranslationsTable)
      .values({
        categoryId,
        locale,
        name,
        description,
      })
      .onConflictDoUpdate({
        target: [categoryTranslationsTable.categoryId, categoryTranslationsTable.locale],
        set: { name, description },
      })
      .returning();

    return translation;
  }

  async remove(categoryId: string, locale: string) {
    if (locale === 'en') {
      throw new BadRequestException("The base English ('en') translation cannot be deleted.");
    }

    const result = await this.db.client
      .delete(categoryTranslationsTable)
      .where(and(
        eq(categoryTranslationsTable.categoryId, categoryId),
        eq(categoryTranslationsTable.locale, locale)
      ))
      .returning();

    if (result.length === 0) {
      throw new NotFoundException(`Translation for locale '${locale}' not found for category ${categoryId}`);
    }
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpsertTagTranslationDto } from './dto/upsert-tag-translation.dto';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { tagTranslationsTable, tagsTable } from '@/_db/drizzle/schema/taxonomy';
import { languagesTable } from '@/_db/drizzle/schema/i18n/language.schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class AdminTagTranslationsService {
  constructor(private readonly db: DrizzleService) {}

  async findAllByTag(tagId: string) {
    const tag = await this.db.client.query.tagsTable.findFirst({
      where: eq(tagsTable.id, tagId),
    });
    if (!tag) throw new NotFoundException(`Tag with ID ${tagId} not found`);

    return this.db.client.query.tagTranslationsTable.findMany({
      where: eq(tagTranslationsTable.tagId, tagId),
    });
  }

  async upsert(tagId: string, dto: UpsertTagTranslationDto) {
    // Verify tag exists
    const tag = await this.db.client.query.tagsTable.findFirst({
      where: eq(tagsTable.id, tagId),
    });
    if (!tag) throw new NotFoundException(`Tag with ID ${tagId} not found`);

    // Verify language exists
    const language = await this.db.client.query.languagesTable.findFirst({
      where: eq(languagesTable.code, dto.locale),
    });
    if (!language) throw new BadRequestException(`Language locale '${dto.locale}' is not supported`);

    const [translation] = await this.db.client
      .insert(tagTranslationsTable)
      .values({
        tagId,
        locale: dto.locale,
        name: dto.name,
        description: dto.description,
      })
      .onConflictDoUpdate({
        target: [tagTranslationsTable.tagId, tagTranslationsTable.locale],
        set: { name: dto.name, description: dto.description },
      })
      .returning();

    return translation;
  }

  async remove(tagId: string, locale: string) {
    if (locale === 'en') {
      throw new BadRequestException("Deleting the default 'en' English locale is not permitted.");
    }

    const result = await this.db.client
      .delete(tagTranslationsTable)
      .where(and(
        eq(tagTranslationsTable.tagId, tagId),
        eq(tagTranslationsTable.locale, locale)
      ))
      .returning();

    if (result.length === 0) {
      throw new NotFoundException(`Translation for locale '${locale}' on tag '${tagId}' not found`);
    }
  }
}

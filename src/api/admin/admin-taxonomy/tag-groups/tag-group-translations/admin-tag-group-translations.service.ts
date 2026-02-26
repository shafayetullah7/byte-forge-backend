import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpsertTagGroupTranslationDto } from './dto/upsert-tag-group-translation.dto';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { tagGroupTranslationsTable, tagGroupsTable } from '@/_db/drizzle/schema/taxonomy';
import { languagesTable } from '@/_db/drizzle/schema/i18n/language.schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class AdminTagGroupTranslationsService {
  constructor(private readonly db: DrizzleService) {}

  async findAllByGroup(groupId: string) {
    const group = await this.db.client.query.tagGroupsTable.findFirst({
      where: eq(tagGroupsTable.id, groupId),
    });
    if (!group) throw new NotFoundException(`Tag Group with ID ${groupId} not found`);

    return this.db.client.query.tagGroupTranslationsTable.findMany({
      where: eq(tagGroupTranslationsTable.groupId, groupId),
    });
  }

  async upsert(groupId: string, dto: UpsertTagGroupTranslationDto) {
    // Verify group exists
    const group = await this.db.client.query.tagGroupsTable.findFirst({
      where: eq(tagGroupsTable.id, groupId),
    });
    if (!group) throw new NotFoundException(`Tag Group with ID ${groupId} not found`);

    // Verify language exists
    const language = await this.db.client.query.languagesTable.findFirst({
      where: eq(languagesTable.code, dto.locale),
    });
    if (!language) throw new BadRequestException(`Language locale '${dto.locale}' is not supported`);

    const [translation] = await this.db.client
      .insert(tagGroupTranslationsTable)
      .values({
        groupId,
        locale: dto.locale,
        name: dto.name,
        description: dto.description,
      })
      .onConflictDoUpdate({
        target: [tagGroupTranslationsTable.groupId, tagGroupTranslationsTable.locale],
        set: { name: dto.name, description: dto.description },
      })
      .returning();

    return translation;
  }

  async remove(groupId: string, locale: string) {
    if (locale === 'en') {
      throw new BadRequestException("Deleting the default 'en' English locale is not permitted.");
    }

    const result = await this.db.client
      .delete(tagGroupTranslationsTable)
      .where(and(
        eq(tagGroupTranslationsTable.groupId, groupId),
        eq(tagGroupTranslationsTable.locale, locale)
      ))
      .returning();

    if (result.length === 0) {
      throw new NotFoundException(`Translation for locale '${locale}' on group '${groupId}' not found`);
    }
  }
}

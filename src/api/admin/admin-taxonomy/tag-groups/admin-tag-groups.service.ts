import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTagGroupDto } from './dto/create-tag-group.dto';
import { UpdateTagGroupDto } from './dto/update-tag-group.dto';
import { TagGroupQueryDto } from './dto/tag-group-query.dto';
import { TagGroupRepository } from '@/_repositories/library/taxonomy/tag-group.repository';
import { tagGroupsTable } from '@/_db/drizzle/schema/taxonomy';

import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { eq, and, isNull, sql, asc, desc, ilike, exists } from 'drizzle-orm';
import { tagsTable, tagGroupTranslationsTable, tagTranslationsTable } from '@/_db/drizzle/schema/taxonomy';
import { isUuid } from '@/common/utils/is-uuid.util';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';

import { paginate } from '../../../../common/utils/pagination.util';

@Injectable()
export class AdminTagGroupsService {
  constructor(
    private readonly tagGroupRepository: TagGroupRepository,
    private readonly db: DrizzleService,
  ) {}

  async create(createTagGroupDto: CreateTagGroupDto) {
    const hasEn = createTagGroupDto.translations.some(t => t.locale === 'en');
    if (!hasEn) throw new BadRequestException("An English ('en') translation is required.");

    return await this.db.client.transaction(async (tx) => {
      const [group] = await tx
        .insert(tagGroupsTable)
        .values({
          slug: createTagGroupDto.slug,
          isActive: createTagGroupDto.isActive ?? true,
        })
        .returning();

      await tx.insert(tagGroupTranslationsTable).values(
        createTagGroupDto.translations.map(t => ({
          groupId: group.id,
          locale: t.locale,
          name: t.name,
          description: t.description,
        }))
      );

      if (createTagGroupDto.tags && createTagGroupDto.tags.length > 0) {
        for (const tagDto of createTagGroupDto.tags) {
          const hasTagEn = tagDto.translations.some(t => t.locale === 'en');
          if (!hasTagEn) throw new BadRequestException("An English ('en') translation is required for all tags.");

          const [tag] = await tx
            .insert(tagsTable)
            .values({
              groupId: group.id,
              slug: tagDto.slug,
              isActive: tagDto.isActive ?? true,
            })
            .returning();
            
          await tx.insert(tagTranslationsTable).values(
            tagDto.translations.map(t => ({
              tagId: tag.id,
              locale: t.locale,
              name: t.name,
              description: t.description,
            }))
          );
        }
      }

      return group;
    });
  }

  async findAll(query: TagGroupQueryDto) {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const offset = (page - 1) * limit;

    const sortByField = query.sortBy === 'updatedAt' ? tagGroupsTable.updatedAt : tagGroupsTable.createdAt;
    
    const sortFn = query.sortOrder === 'asc' ? asc : desc;

    const searchCondition = query.name || query.search ? exists(
      this.db.client.select({ id: tagGroupTranslationsTable.id })
        .from(tagGroupTranslationsTable)
        .where(and(
          eq(tagGroupTranslationsTable.groupId, tagGroupsTable.id),
          query.name ? eq(tagGroupTranslationsTable.name, query.name) : undefined,
          query.search ? ilike(tagGroupTranslationsTable.name, `%${query.search}%`) : undefined
        ))
    ) : undefined;

    // Apply conditional filters strictly aligned with QUERIES.md
    const conditions = and(
        isNull(tagGroupsTable.deletedAt),
        query.id ? eq(tagGroupsTable.id, query.id) : undefined,
        query.isActive !== undefined ? eq(tagGroupsTable.isActive, query.isActive === 'true') : undefined,
        searchCondition
    );

    const [data, [{ total }]] = await Promise.all([
      this.db.client.query.tagGroupsTable.findMany({
        where: conditions,
        orderBy: [sortFn(sortByField)],
        limit,
        offset,
        with: {
          tags: {
            where: (tags, { isNull }) => isNull(tags.deletedAt),
            with: { translations: true }
          },
          translations: true,
        },
      }),
      this.db.client
        .select({ total: sql`count(*)`.mapWith(Number) })
        .from(tagGroupsTable)
        .where(conditions)
    ]);

    const groups = data.map(item => ({
      ...item,
      tagCount: item.tags?.length || 0,
    }));

    return paginate(groups, total, page, limit);
  }

  async findOne(id: string) {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid Tag Group ID format. Must be a UUID.');
    }

    const group = await this.db.client.query.tagGroupsTable.findFirst({
      where: and(eq(tagGroupsTable.id, id), isNull(tagGroupsTable.deletedAt)),
      with: { translations: true },
    });

    if (!group) throw new NotFoundException(`Tag Group with ID ${id} not found`);
    return group;
  }

  async update(id: string, updateTagGroupDto: UpdateTagGroupDto) {
    const group = await this.findOne(id);

    const [updated] = await this.db.client
      .update(tagGroupsTable)
      .set({ ...updateTagGroupDto, updatedAt: new Date() })
      .where(and(eq(tagGroupsTable.id, group.id), isNull(tagGroupsTable.deletedAt)))
      .returning();

    return updated;
  }

  async remove(id: string) {
    const group = await this.findOne(id);
    
    // Check if tags exist in this group before deleting
    const relatedTags = await this.db.client
      .select({ id: tagsTable.id })
      .from(tagsTable)
      .where(and(
        eq(tagsTable.groupId, id),
        isNull(tagsTable.deletedAt)
      ))
      .limit(1);
      
    if (relatedTags.length > 0) {
      throw new BadRequestException("Cannot delete Tag Group. It currently contains active tags.");
    }
    
    await this.tagGroupRepository.softDelete(group.id);
  }
}

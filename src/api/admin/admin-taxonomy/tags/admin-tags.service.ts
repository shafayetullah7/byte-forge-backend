import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';
import { eq, and, isNull, ilike, asc, desc, sql, exists } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { tagsTable, tagGroupsTable, tagTranslationsTable } from '@/_db/drizzle/schema/taxonomy';
import { paginate } from '../../../../common/utils/pagination.util';
import { isUuid } from '@/common/utils/is-uuid.util';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';

@Injectable()
export class AdminTagsService {
  constructor(
    private readonly db: DrizzleService,
  ) {}

  async create(createTagDto: CreateTagDto) {
    const hasEn = createTagDto.translations.some(t => t.locale === 'en');
    if (!hasEn) throw new BadRequestException("An English ('en') translation is required.");

    // 1. Verify group exists and is not deleted
    const group = await this.db.client.query.tagGroupsTable.findFirst({
      where: and(eq(tagGroupsTable.id, createTagDto.groupId), isNull(tagGroupsTable.deletedAt)),
    });
    if (!group) throw new BadRequestException(`Tag Group ${createTagDto.groupId} does not exist.`);

    return await this.db.client.transaction(async (tx) => {
      const [tag] = await tx
        .insert(tagsTable)
        .values({
          slug: createTagDto.slug,
          groupId: createTagDto.groupId,
          isActive: createTagDto.isActive ?? true,
        })
        .returning();

      await tx.insert(tagTranslationsTable).values(
        createTagDto.translations.map(t => ({
          tagId: tag.id,
          locale: t.locale,
          name: t.name,
          description: t.description,
        }))
      );

      return tag;
    });
  }

  private buildWhere(query: TagQueryDto) {
    const searchCondition = query.name || query.search ? exists(
      this.db.client.select({ id: tagTranslationsTable.id })
        .from(tagTranslationsTable)
        .where(and(
          eq(tagTranslationsTable.tagId, tagsTable.id),
          query.name ? eq(tagTranslationsTable.name, query.name) : undefined,
          query.search ? ilike(tagTranslationsTable.name, `%${query.search}%`) : undefined
        ))
    ) : undefined;

    return and(
      isNull(tagsTable.deletedAt),
      query.id ? eq(tagsTable.id, query.id) : undefined,
      query.groupId ? eq(tagsTable.groupId, query.groupId) : undefined,
      query.isActive !== undefined ? eq(tagsTable.isActive, query.isActive === 'true') : undefined,
      searchCondition
    );
  }

  async findAll(query: TagQueryDto) {
    const limit = query.limit ? Number(query.limit) : 20;
    const page = query.page ? Number(query.page) : 1;
    const offset = (page - 1) * limit;

    const sortByField = query.sortBy === 'updatedAt' ? tagsTable.updatedAt : tagsTable.createdAt;
      
    const sortFn = query.sortOrder === 'asc' ? asc : desc;
    const conditions = this.buildWhere(query);

    const [data, [{ total }]] = await Promise.all([
      this.db.client.query.tagsTable.findMany({
        where: conditions,
        orderBy: [sortFn(sortByField)],
        limit,
        offset,
        with: { translations: true },
      }),
      this.db.client
        .select({ total: sql`count(*)`.mapWith(Number) })
        .from(tagsTable)
        .where(conditions)
    ]);

    // Admin returns all raw translations, so we just map tag directly 
    // unless a specific translation resolution is requested by caller context (for now, admin gets all)
    return paginate(data, total, page, limit);
  }

  async findOne(id: string) {
    const isIdUuid = isUuid(id);
    const condition = isIdUuid ? eq(tagsTable.id, id) : eq(tagsTable.slug, id);

    const tag = await this.db.client.query.tagsTable.findFirst({
        where: and(condition, isNull(tagsTable.deletedAt)),
        with: { translations: true },
    });

    if (!tag) throw new NotFoundException(`Tag ${id} not found`);
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const tag = await this.findOne(id);

    // Validate groupId change if provided
    if (updateTagDto.groupId && updateTagDto.groupId !== tag.groupId) {
      const group = await this.db.client.query.tagGroupsTable.findFirst({
        where: and(eq(tagGroupsTable.id, updateTagDto.groupId), isNull(tagGroupsTable.deletedAt)),
      });
      if (!group) throw new BadRequestException(`Tag Group ${updateTagDto.groupId} does not exist.`);
    }

    const [updated] = await this.db.client
      .update(tagsTable)
      .set({ ...updateTagDto, updatedAt: new Date() })
      .where(and(eq(tagsTable.id, tag.id), isNull(tagsTable.deletedAt)))
      .returning();

    return updated;
  }

  async remove(id: string) {
    const tag = await this.findOne(id);

    // Check usage before deletion
    if (tag.usageCount > 0) {
      throw new BadRequestException('Cannot delete tag. It is currently being used by products.');
    }

    await this.db.client
      .update(tagsTable)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(tagsTable.id, tag.id));
  }
}

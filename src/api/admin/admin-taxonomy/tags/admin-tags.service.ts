import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';
import { eq, and, isNull, ilike, asc, desc, sql } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { tagsTable, tagGroupsTable } from '@/_db/drizzle/schema/taxonomy';
import { paginate } from '../../../../common/utils/pagination.util';
import { isUuid } from '@/common/utils/is-uuid.util';

@Injectable()
export class AdminTagsService {
  constructor(
    private readonly db: DrizzleService,
  ) {}

  async create(createTagDto: CreateTagDto) {
    // 1. Verify group exists and is not deleted
    const group = await this.db.client.query.tagGroupsTable.findFirst({
      where: and(eq(tagGroupsTable.id, createTagDto.groupId), isNull(tagGroupsTable.deletedAt)),
    });
    if (!group) throw new BadRequestException(`Tag Group ${createTagDto.groupId} does not exist.`);

    const [tag] = await this.db.client
      .insert(tagsTable)
      .values({
        name: createTagDto.name,
        slug: createTagDto.slug,
        groupId: createTagDto.groupId,
        description: createTagDto.description,
        isActive: createTagDto.isActive ?? true,
      })
      .returning();

    return tag;
  }

  private buildWhere(query: TagQueryDto) {
    return and(
      isNull(tagsTable.deletedAt),
      query.id ? eq(tagsTable.id, query.id) : undefined,
      query.groupId ? eq(tagsTable.groupId, query.groupId) : undefined,
      query.name ? eq(tagsTable.name, query.name) : undefined,
      query.search ? ilike(tagsTable.name, `%${query.search}%`) : undefined,
      query.isActive !== undefined ? eq(tagsTable.isActive, query.isActive === 'true') : undefined
    );
  }

  async findAll(query: TagQueryDto) {
    const limit = query.limit ? Number(query.limit) : 20;
    const page = query.page ? Number(query.page) : 1;
    const offset = (page - 1) * limit;

    const sortByField = query.sortBy === 'name' ? tagsTable.name 
      : query.sortBy === 'updatedAt' ? tagsTable.updatedAt 
      : tagsTable.createdAt;
      
    const sortFn = query.sortOrder === 'asc' ? asc : desc;
    const conditions = this.buildWhere(query);

    const [data, [{ total }]] = await Promise.all([
      this.db.client.query.tagsTable.findMany({
        where: conditions,
        orderBy: [sortFn(sortByField)],
        limit,
        offset,
      }),
      this.db.client
        .select({ total: sql`count(*)`.mapWith(Number) })
        .from(tagsTable)
        .where(conditions)
    ]);

    return paginate(data, total, page, limit);
  }

  async findOne(id: string) {
    const isIdUuid = isUuid(id);
    const condition = isIdUuid ? eq(tagsTable.id, id) : eq(tagsTable.slug, id);

    const tag = await this.db.client.query.tagsTable.findFirst({
        where: and(condition, isNull(tagsTable.deletedAt)),
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

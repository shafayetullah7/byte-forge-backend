import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTagGroupDto } from './dto/create-tag-group.dto';
import { UpdateTagGroupDto } from './dto/update-tag-group.dto';
import { TagGroupQueryDto } from './dto/tag-group-query.dto';
import { TagGroupRepository } from '@/_repositories/library/taxonomy/tag-group.repository';
import { tagGroupsTable } from '@/_db/drizzle/schema/taxonomy';

import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { eq, and, isNull, sql, asc, desc, ilike } from 'drizzle-orm';
import { tagsTable } from '@/_db/drizzle/schema/taxonomy';
import { isUuid } from '@/common/utils/is-uuid.util';

import { paginate } from '../../../../common/utils/pagination.util';

@Injectable()
export class AdminTagGroupsService {
  constructor(
    private readonly tagGroupRepository: TagGroupRepository,
    private readonly db: DrizzleService,
  ) {}

  async create(createTagGroupDto: CreateTagGroupDto) {
    const group = await this.tagGroupRepository.create({
      name: createTagGroupDto.name,
      description: createTagGroupDto.description,
      isActive: createTagGroupDto.isActive ?? true,
    });

    if (createTagGroupDto.tags && createTagGroupDto.tags.length > 0) {
      const tagsToInsert = createTagGroupDto.tags.map(tag => ({
        groupId: group.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        isActive: tag.isActive ?? true,
      }));
      await this.db.client.insert(tagsTable).values(tagsToInsert);
    }

    return group;
  }

  async findAll(query: TagGroupQueryDto) {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const offset = (page - 1) * limit;

    const sortByField = query.sortBy === 'name' ? tagGroupsTable.name 
      : query.sortBy === 'updatedAt' ? tagGroupsTable.updatedAt 
      : tagGroupsTable.createdAt;
    
    const sortFn = query.sortOrder === 'asc' ? asc : desc;

    // Apply conditional filters strictly aligned with QUERIES.md
    const conditions = and(
        isNull(tagGroupsTable.deletedAt),
        query.id ? eq(tagGroupsTable.id, query.id) : undefined,
        query.name ? eq(tagGroupsTable.name, query.name) : undefined,
        query.search ? ilike(tagGroupsTable.name, `%${query.search}%`) : undefined,
        query.isActive !== undefined ? eq(tagGroupsTable.isActive, query.isActive === 'true') : undefined
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
          },
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

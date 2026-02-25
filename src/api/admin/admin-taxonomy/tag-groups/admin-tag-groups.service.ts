import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTagGroupDto } from './dto/create-tag-group.dto';
import { UpdateTagGroupDto } from './dto/update-tag-group.dto';
import { TagGroupQueryDto } from './dto/tag-group-query.dto';
import { TagGroupRepository } from '@/_repositories/library/taxonomy/tag-group.repository';
import { tagGroupsTable } from '@/_db/drizzle/schema/taxonomy';
import { getTableColumns } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { eq, and, isNull } from 'drizzle-orm';
import { tagsTable } from '@/_db/drizzle/schema/taxonomy';

import { paginate } from '../../../../common/utils/pagination.util';

@Injectable()
export class AdminTagGroupsService {
  constructor(
    private readonly tagGroupRepository: TagGroupRepository,
    private readonly db: DrizzleService,
  ) {}

  async create(createTagGroupDto: CreateTagGroupDto) {
    return this.tagGroupRepository.create({
      name: createTagGroupDto.name,
      description: createTagGroupDto.description,
      isActive: createTagGroupDto.isActive ?? true,
    });
  }

  async findAll(query: TagGroupQueryDto) {
    const [data, total] = await Promise.all([
      this.tagGroupRepository.findMany(query),
      this.tagGroupRepository.count(query)
    ]);

    const groups = data.map(item => ({
      ...item,
      tagCount: item.tags?.length || 0,
    }));

    return paginate(groups, total, query.page ?? 1, query.limit ?? 10);
  }

  async findOne(id: string) {
    const group = await this.tagGroupRepository.findOne(id);
    if (!group) throw new NotFoundException(`Tag Group with ID ${id} not found`);
    return group;
  }

  async update(id: string, updateTagGroupDto: UpdateTagGroupDto) {
    const group = await this.findOne(id);
    return this.tagGroupRepository.update(group.id, updateTagGroupDto);
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

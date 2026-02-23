import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagGroupDto } from './dto/create-tag-group.dto';
import { UpdateTagGroupDto } from './dto/update-tag-group.dto';
import { TagGroupQueryDto } from './dto/tag-group-query.dto';
import { TagGroupRepository } from '@/_repositories/library/taxonomy/tag-group.repository';
import { tagGroupsTable } from '@/_db/drizzle/schema/taxonomy';
import { getTableColumns } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { eq } from 'drizzle-orm';
import { tagsTable } from '@/_db/drizzle/schema/taxonomy';

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

    return {
      data,
      meta: {
        total,
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
      }
    };
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
      .where(eq(tagsTable.groupId, id))
      .limit(1);
      
    if (relatedTags.length > 0) {
      throw new Error("Cannot delete Tag Group. It currently contains tags.");
    }
    
    await this.tagGroupRepository.softDelete(group.id);
  }
}

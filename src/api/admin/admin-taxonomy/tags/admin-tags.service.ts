import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';
import { eq } from 'drizzle-orm';
import { TagRepository } from '@/_repositories/library/taxonomy/tag.repository';
import { TagGroupRepository } from '@/_repositories/library/taxonomy/tag-group.repository';

// Note: simple slugifier. 
// In production, consider a robust library or moving to a utility.
const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

import { paginate } from '../../../../common/utils/pagination.util';

@Injectable()
export class AdminTagsService {
  constructor(
    private readonly tagRepository: TagRepository,
    private readonly tagGroupRepository: TagGroupRepository,
  ) {}

  async create(createTagDto: CreateTagDto) {
    // 1. Verify the group exists
    const group = await this.tagGroupRepository.findOne(createTagDto.groupId);
    if (!group) throw new BadRequestException(`Tag Group ${createTagDto.groupId} does not exist.`);

    return this.tagRepository.create({
      name: createTagDto.name,
      slug: createTagDto.slug,
      groupId: createTagDto.groupId,
      description: createTagDto.description,
      isActive: createTagDto.isActive ?? true,
    });
  }

  async findAll(query: TagQueryDto) {
    const [data, total] = await Promise.all([
      this.tagRepository.findMany(query),
      this.tagRepository.count(query)
    ]);

    return paginate(data, total, query.page ?? 1, query.limit ?? 10);
  }

  async findOne(id: string) {
    const tag = await this.tagRepository.findOne(id);
    if (!tag) throw new NotFoundException(`Tag ${id} not found`);
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const tag = await this.findOne(id);
    
    // Create update payload
    const payload: any = { ...updateTagDto };
    
    // Handle groupId change validation
    if (updateTagDto.groupId && updateTagDto.groupId !== tag.groupId) {
        const group = await this.tagGroupRepository.findOne(updateTagDto.groupId);
        if (!group) throw new BadRequestException(`Tag Group ${updateTagDto.groupId} does not exist.`);
    }

    return this.tagRepository.update(tag.id, payload);
  }

  async remove(id: string) {
    const tag = await this.findOne(id);
    
    // Check usage before deletion
    if (tag.usageCount > 0) {
      throw new BadRequestException("Cannot delete tag. It is currently being used by products.");
    }
    
    await this.tagRepository.softDelete(tag.id);
  }
}

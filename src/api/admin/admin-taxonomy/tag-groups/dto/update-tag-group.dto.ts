import { PartialType } from '@nestjs/mapped-types';
import { CreateTagGroupDto } from './create-tag-group.dto';

export class UpdateTagGroupDto extends PartialType(CreateTagGroupDto) {}

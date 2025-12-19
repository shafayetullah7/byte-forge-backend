import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  iconId: z.uuid().optional(),
  isHidden: z.boolean().optional(),
});

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}

export const UpdateCategorySchema = CreateCategorySchema.partial();

export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}

export const CategoryFilterSchema = z.object({
  id: z.uuid().optional(),
  searchKey: z.string().optional(),
  name: z.string().optional(),
  isHidden: z.coerce.boolean().optional(),
  isDeleted: z.coerce.boolean().optional(),
});

export class CategoryFilterDto extends createZodDto(CategoryFilterSchema) {}

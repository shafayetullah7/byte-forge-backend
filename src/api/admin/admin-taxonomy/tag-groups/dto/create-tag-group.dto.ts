import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createTagGroupSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(255),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  tags: z.array(
    z.object({
      name: z.string().trim().min(1, 'Tag name cannot be empty').max(255),
      slug: z.string().trim().min(1, 'Tag slug is required').max(255),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    })
  )
  .superRefine((tags, ctx) => {
    const slugSet = new Set<string>();
    const nameSet = new Set<string>();

    tags.forEach((tag, index) => {
      if (slugSet.has(tag.slug)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Duplicate tag slug in the request',
          path: [index, 'slug'],
        });
      }
      slugSet.add(tag.slug);

      const lowerName = tag.name.toLowerCase();
      if (nameSet.has(lowerName)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Duplicate tag name in the request',
          path: [index, 'name'],
        });
      }
      nameSet.add(lowerName);
    });
  })
  .optional(),
});

export class CreateTagGroupDto extends createZodDto(createTagGroupSchema) {}

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { SlugSchema } from '@/common/schemas/slug.schema';

const createTagGroupSchema = z.object({
  slug: SlugSchema,
  isActive: z.boolean().optional(),
  translations: z.array(
    z.object({
      locale: z.string().trim().min(2).max(10),
      name: z.string().trim().min(1, 'Name cannot be empty').max(255),
      description: z.string().optional(),
    })
  ).min(1, 'At least one translation is required'),
  tags: z.array(
    z.object({
      slug: SlugSchema,
      isActive: z.boolean().optional(),
      translations: z.array(
        z.object({
          locale: z.string().trim().min(2).max(10),
          name: z.string().trim().min(1, 'Tag name cannot be empty').max(255),
          description: z.string().optional(),
        })
      ).min(1, 'At least one translation is required'),
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

      // We no longer validate English name strictly here because duplicate names 
      // are allowed across different locales. DB constraints handle duplicates per-locale.
    });
  })
  .optional(),
});

export class CreateTagGroupDto extends createZodDto(createTagGroupSchema) {}

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationParamsSchema } from '@/common/schemas/pagination.schema';

// --- Shared Schemas ---

const CareSchema = z.object({
  lightLevel: z.string().max(100).optional(),
  wateringFrequency: z.string().max(100).optional(),
  humidityLevel: z.string().max(100).optional(),
  tempRange: z.string().max(100).optional(),
  soilType: z.string().max(255).optional(),
  careDifficulty: z.enum(['Beginner', 'Intermediate', 'Expert']).optional(),
  petSafety: z.enum(['Safe', 'Toxic', 'Unknown']).optional(),
  fertilizerSchedule: z.string().optional(),
  repottingFrequency: z.string().optional(),
  pruningNotes: z.string().optional(),
});

const SeoSchema = z.object({
  metaTitle: z.string().max(100).optional(),
  metaDescription: z.string().max(255).optional(),
  slug: z.string().max(255).optional(),
  focusKeywords: z.string().optional(),
  internalNotes: z.string().optional(),
});

const MediaItemSchema = z.object({
  mediaId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  displayOrder: z.number().int().min(0).default(0),
  type: z.enum(['image', 'video']).default('image'),
});

const VariantSchema = z.object({
  name: z.string().min(1).max(255),
  sku: z.string().max(100).optional(),
  
  // Attributes (Open fields)
  potSize: z.string().max(50).optional(),
  plantHeight: z.coerce.number().int().min(0).optional(), // cm
  growthStage: z.string().max(50).optional(),
  propagationType: z.string().max(50).optional(),
  plantForm: z.string().max(50).optional(),
  variegation: z.string().max(50).optional(),
  containerType: z.string().max(50).optional(),
  bundleType: z.string().max(50).optional(),

  // Pricing (Moved here)
  price: z.number().int().min(0).default(0),
  salePrice: z.number().int().min(0).optional(),
  costPrice: z.number().int().min(0).optional(),
  
  // Inventory (Moved here)
  stockCount: z.number().int().min(0).default(0),
  trackQuantity: z.boolean().default(true),
  lowStockAlert: z.number().int().min(0).default(5),
});

const PlantTranslationSchema = z.object({
  locale: z.string().min(2).max(10),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
});

// --- Primary DTOs ---

export const CreatePlantSchema = z.object({
  categoryId: z.uuid({ message: 'message.validation.invalidUuid' }).optional().nullable(),
  name: z.string().min(1, { message: 'message.validation.notEmpty' }).max(255, { message: 'message.validation.maxLength' }),
  scientificName: z.string().max(255).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  isFeatured: z.boolean().default(false),
  status: z.enum(['active', 'draft', 'archived']).default('draft'),
  translations: z.array(PlantTranslationSchema).min(1, { message: 'Base translation required' }),

  // Nested Modular Data
  care: CareSchema.optional(),
  seo: SeoSchema.optional(),
  media: z.array(MediaItemSchema).optional(),
  variants: z.array(VariantSchema).min(1, { message: 'At least one variant is required' }),
});

export class CreatePlantDto extends createZodDto(CreatePlantSchema) {}

export const UpdatePlantSchema = CreatePlantSchema.partial();

export class UpdatePlantDto extends createZodDto(UpdatePlantSchema) {}

export const PlantFilterSchema = PaginationParamsSchema.extend({
  shopId: z.uuid().optional(),
  categoryId: z.uuid().optional(),
  name: z.string().optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
  isFeatured: z.coerce.boolean().optional(),
  searchKey: z.string().optional(),
});

export class PlantFilterDto extends createZodDto(PlantFilterSchema) {}

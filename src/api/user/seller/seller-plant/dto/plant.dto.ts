import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationParamsSchema } from '@/common/schemas/pagination.schema';

// --- Shared Schemas ---
const PricingSchema = z.object({
  price: z.number().int().min(0).default(0),
  salePrice: z.number().int().min(0).optional(),
  costPrice: z.number().int().min(0).optional(),
  trackQuantity: z.boolean().default(true),
  allowBackorders: z.boolean().default(false),
});

const InventorySchema = z.object({
  stockCount: z.number().int().min(0).default(0),
  lowStockAlert: z.number().int().min(0).default(5),
  supplier: z.string().max(255).optional(),
  storageLocation: z.string().max(255).optional(),
  weight: z.string().optional(), // numeric as string for precision
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  shippingClass: z.string().max(100).optional(),
  specialHandling: z.boolean().default(false),
});

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
  displayOrder: z.number().int().min(0).default(0),
  type: z.enum(['image', 'video']).default('image'),
});

const VariantSchema = z.object({
  name: z.string().min(1).max(255),
  sku: z.string().max(100).optional(),
  price: z.number().int().min(0).default(0),
  stockCount: z.number().int().min(0).default(0),
});

// --- Primary DTOs ---

export const CreatePlantSchema = z.object({
  categoryId: z.uuid({ message: 'message.validation.invalidUuid' }).optional().nullable(),
  name: z.string().min(1, { message: 'message.validation.notEmpty' }).max(255, { message: 'message.validation.maxLength' }),
  scientificName: z.string().max(255).optional(),
  sku: z.string().max(100).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  isFeatured: z.boolean().default(false),
  status: z.enum(['active', 'draft', 'archived']).default('draft'),
  mainImageId: z.string().uuid().optional(),

  // Nested Modular Data
  pricing: PricingSchema.optional(),
  inventory: InventorySchema.optional(),
  care: CareSchema.optional(),
  seo: SeoSchema.optional(),
  media: z.array(MediaItemSchema).optional(),
  variants: z.array(VariantSchema).optional(),
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

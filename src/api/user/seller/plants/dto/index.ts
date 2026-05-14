export * from './create-plant.dto';
export * from './update-plant.dto';
export * from './update-plant-status.dto';
export * from './get-plant-by-id-params.dto';

// Re-export schemas for use in other DTOs
export {
  productTranslationSchema,
  plantDetailsSchema,
  plantDetailsTranslationSchema,
  plantVariantAttributesSchema,
  productVariantSchema,
  careGuideSchema,
  SlugSchema,
  UUIDSchema,
  LocaleSchema,
} from './create-plant.dto';

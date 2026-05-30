export const ProductMediaTypeEnum = {
  IMAGE: 'image',
  VIDEO: 'video',
} as const;

export type TProductMediaType =
  (typeof ProductMediaTypeEnum)[keyof typeof ProductMediaTypeEnum];

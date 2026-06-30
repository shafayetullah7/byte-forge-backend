import { createZodDto } from 'nestjs-zod';
import { publicShopSlugSchema } from '@/api/public/shops/dto/public-shop-slug.dto';

export class ShopSlugParamDto extends createZodDto(publicShopSlugSchema) {}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductThumbnailResponseDto {
  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  id!: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/...' })
  url!: string;
}

export class ProductListItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'monstera-deliciosa' })
  slug!: string;

  @ApiProperty({ enum: ['plant', 'pot', 'seed', 'fertilizer'], example: 'plant' })
  productType!: string;

  @ApiProperty({ enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], example: 'ACTIVE' })
  status!: string;

  @ApiPropertyOptional({ type: ProductThumbnailResponseDto })
  thumbnail?: ProductThumbnailResponseDto;

  @ApiPropertyOptional({ example: 'Monstera Deliciosa' })
  name?: string;

  @ApiPropertyOptional({ example: 'A popular tropical houseplant' })
  shortDescription?: string;

  @ApiPropertyOptional({ example: '29.99' })
  price?: string;

  @ApiProperty({ example: 50 })
  inventoryCount!: number;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;
}

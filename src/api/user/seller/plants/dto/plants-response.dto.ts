import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlantCategoryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'indoor-plants' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Indoor Plants' })
  name?: string;
}

export class PlantTagResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: '4-inch' })
  slug!: string;

  @ApiPropertyOptional({ example: '4 inch' })
  name?: string;
}

export class PlantThumbnailResponseDto {
  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  id!: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/...' })
  url!: string;
}

export class PlantListItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'monstera-deliciosa' })
  slug!: string;

  @ApiProperty({
    enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'],
    example: 'ACTIVE',
  })
  status!: string;

  @ApiPropertyOptional({ type: PlantThumbnailResponseDto })
  thumbnail?: PlantThumbnailResponseDto;

  @ApiPropertyOptional({ example: 'Monstera Deliciosa' })
  name?: string;

  @ApiPropertyOptional({ example: 'A popular tropical houseplant' })
  shortDescription?: string;

  @ApiPropertyOptional({ example: 29.99 })
  price?: number;

  @ApiProperty({ example: 50 })
  inventoryCount!: number;

  @ApiPropertyOptional({ type: PlantCategoryResponseDto })
  category?: PlantCategoryResponseDto;

  @ApiPropertyOptional({ type: [PlantTagResponseDto] })
  tags?: PlantTagResponseDto[];

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;
}

export class PlantCreateResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'monstera-deliciosa' })
  slug!: string;

  @ApiProperty({ enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] })
  status!: string;

  @ApiPropertyOptional({ type: PlantThumbnailResponseDto })
  thumbnail?: PlantThumbnailResponseDto;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  shortDescription?: string;

  @ApiPropertyOptional()
  price?: number;

  @ApiProperty()
  inventoryCount!: number;

  @ApiPropertyOptional({ type: PlantCategoryResponseDto })
  category?: PlantCategoryResponseDto;

  @ApiPropertyOptional({ type: [PlantTagResponseDto] })
  tags?: PlantTagResponseDto[];

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;
}

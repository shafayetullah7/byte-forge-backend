import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlantCategoryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'indoor-plants' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Indoor Plants' })
  name?: string;
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

  @ApiPropertyOptional({
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  thumbnailId?: string;

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

  @ApiPropertyOptional()
  thumbnailId?: string;

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

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;
}

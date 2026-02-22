import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID(4)
  parentId?: string; // Used to compute the hierarchy closure

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;
}

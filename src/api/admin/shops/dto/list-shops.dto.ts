import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ShopStatusEnum } from '../../../../_db/drizzle/enum';

export class ListShopsDto {
  @IsOptional()
  @IsEnum(ShopStatusEnum)
  status?: keyof typeof ShopStatusEnum;

  @IsOptional()
  @IsString()
  division?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}
